export const selectUser        = (state) => state.getme?.user || state.auth?.user;
export const selectUserId      = (state) => state.getme?.user?._id || state.auth?.user?._id || state.auth?.user?.id;
export const selectSchool      = (state) => state.getme?.school;
export const selectInvitation  = (state) => state.getme?.invitation;
export const selectAppState    = (state) => state.getme?.state;
export const selectAuthStatus  = (state) => state.getme?.status;
export const selectAuthError   = (state) => state.getme?.error;

export const selectIsActive    = (state) => state.getme?.state === "ACTIVE";
export const selectIsNoSchool  = (state) => state.getme?.state === "NO_SCHOOL";
export const selectIsPending   = (state) => state.getme?.state === "PENDING_VERIFICATION";
export const selectIsLoading   = (state) => state.getme?.status === "loading";