import crypto from "crypto";

import School from "../models/school_admin/school.model.js";
import sendEmail from "../utils/sendEmail.js";
import logger from "../utils/logger.js";

import { User } from "../models/auth/user.model.js";
import { UserInvitation } from "../models/auth/userInvitation.model.js";

export const inviteUserService = async ({
  school_id,
  userId,
  email,
  role,
  frontendUrl,
}) => {
  // 1️⃣ Check school verification status
  logger.info(`Inviting user to school: ${school_id} email: ${email}`);
  const school = await School.findById(school_id);

  if (!school) {
    throw new Error("School not found");
  }

  if (school.verificationStatus !== "verified") {
    throw new Error(
      "Your school is not verified. You cannot add staff until verification is complete.",
    );
  }

  if (!school.isActive) {
    throw new Error("School is inactive");
  }

  // 1b Check if the inviter is the admin
  const inviter = await User.findById(userId);
  if (!inviter || inviter.role !== "school_admin") {
    throw new Error("Only school admins can invite new members.");
  }

  // 1c Check if the invited role is valid
  if (!["teacher", "staff"].includes(role)) {
    throw new Error("Only teachers or staff members can be invited.");
  }

  // 2️⃣ Generate invite token
  const inviteToken = crypto.randomBytes(32).toString("hex");

  // 3️⃣ Create invitation

  // Check if there's already a pending invitation for the same email
  const existingInvitation = await UserInvitation.findOne({
    school_id,
    email,
    accepted_at: null,
    expires_at: { $gt: new Date() }
  });

  if (existingInvitation) {
    throw new Error("An active invitation already exists for this user.");
  }

  const userInvitation = await UserInvitation.create({
    school_id: school_id,
    email,
    role,
    invited_by: userId,
    invite_token: inviteToken,
    expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
  });

  const user = await User.findOne({ email });

  if (user) {
    user.invited_by = userId;
    if (user.status !== "active") {
      user.status = "invited";
    }
    await user.save();
  }

  // 4️⃣ Send email
  await sendEmail({
    to: email,
    subject: `You're invited to join ${school.name} on Drona ERP 🎉`,
    html: `
      <div style="font-family: 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; line-height: 1.6; color: #1e293b; max-width: 600px; margin: 0 auto; border: 1px solid #e2e8f0; border-radius: 24px; overflow: hidden; background: #ffffff;">
        <div style="background: linear-gradient(135deg, #2563eb 0%, #3b82f6 100%); padding: 40px 20px; text-align: center;">
          <h1 style="color: white; margin: 0; font-size: 24px; font-weight: 800; letter-spacing: -0.025em;">School Portal Invitation</h1>
        </div>
        
        <div style="padding: 40px;">
          <p style="margin-top: 0; font-size: 16px; font-weight: 600; color: #1e293b;">Welcome!</p>
          <p style="font-size: 16px; color: #475569;">You have been invited to join <strong>${school.name}</strong> as a <strong>${role}</strong>. We're excited to have you on board!</p>
          
          <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 16px; padding: 24px; margin: 24px 0; text-align: center;">
            <p style="color: #64748b; font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.05em; margin-bottom: 12px;">Your Invitation Token</p>
            <div style="
              background: #ffffff;
              border: 2px dashed #2563eb;
              border-radius: 12px;
              padding: 16px;
              font-family: 'Courier New', Courier, monospace;
              font-size: 20px;
              font-weight: 800;
              color: #2563eb;
              letter-spacing: 2px;
            ">
              ${inviteToken}
            </div>
          </div>

          <p style="font-size: 15px; color: #475569; margin-bottom: 24px;">
            Please use this token to accept your invitation in the Drona portal. If you did not expect this invitation, you can safely ignore this email.
          </p>

          <p style="color: #64748b; font-size: 14px; margin-bottom: 0;">Thanks,<br/><strong>Drona Team</strong></p>
        </div>

        <div style="background: #f8fafc; padding: 24px; text-align: center; border-top: 1px solid #e2e8f0;">
          <p style="margin: 0; color: #94a3b8; font-size: 12px; font-weight: 600;">Sent by <strong>${school.name}</strong> via Drona ERP</p>
        </div>
      </div>
    `,
  });

  return {
    message: "Invitation sent successfully",
    inviteLink: `${frontendUrl}/invite/${inviteToken}`,
    invitation: userInvitation,
  };
};

export const acceptInvitationService = async ({ token, userId }) => {
  const invitation = await UserInvitation.findOne({
    invite_token: token,
  });

  if (!invitation) {
    throw new Error("Invalid invitation");
  }

  if (invitation.expires_at < new Date()) {
    throw new Error("Invitation expired");
  }

  if (invitation.accepted_at) {
    throw new Error("Already accepted");
  }

  const user = await User.findById(userId);

  if (!user) {
    throw new Error("User not found");
  }

  if (user.email !== invitation.email) {
    throw new Error("This invitation is not for this account");
  }

  user.school_id = invitation.school_id;
  user.role = invitation.role;
  user.status = "active";

  await user.save();

  invitation.accepted_at = new Date();
  await invitation.save();

  return {
    message: "Joined successfully",
    user: user.toJSON(),
  };
};

/**
 * Fetch all pending invitations for a school
 */
export const fetchPendingInvitationsService = async (school_id) => {
  return await UserInvitation.find({
    school_id,
    accepted_at: null,
    expires_at: { $gt: new Date() },
  })
    .populate("invited_by", "name email")
    .sort({ createdAt: -1 });
};

/**
 * Revoke/Delete a pending invitation
 */
export const revokeInvitationService = async (invitationId, school_id) => {
  const invitation = await UserInvitation.findOne({
    _id: invitationId,
    school_id,
  });

  if (!invitation) {
    throw new Error("Invitation not found or unauthorized");
  }

  if (invitation.accepted_at) {
    throw new Error("Cannot revoke an already accepted invitation");
  }

  await UserInvitation.findByIdAndDelete(invitationId);

  return { message: "Invitation revoked successfully" };
};

/**
 * Get invitation details by token
 */
export const getInvitationByTokenService = async (token) => {
  const invitation = await UserInvitation.findOne({
    invite_token: token,
    accepted_at: null,
    expires_at: { $gt: new Date() },
  }).populate("school_id", "name logoUrl");

  if (!invitation) {
    throw new Error("Invalid or expired invitation");
  }

  return invitation;
};
