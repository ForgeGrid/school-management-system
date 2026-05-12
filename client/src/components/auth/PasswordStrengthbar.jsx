function getPasswordStrength(password) {
  if (!password) return null;
  if (password.length < 8) return { level: 0, label: "Too short",  color: "bg-red-500",    width: "w-1/4"  };

  let score = 0;
  if (password.length >= 10)           score++;
  if (/[A-Z]/.test(password))          score++;
  if (/[0-9]/.test(password))          score++;
  if (/[^A-Za-z0-9]/.test(password))   score++;

  if (score <= 1) return { level: 1, label: "Weak",   color: "bg-orange-400", width: "w-2/4" };
  if (score <= 2) return { level: 2, label: "Fair",   color: "bg-yellow-400", width: "w-3/4" };
  if (score === 3) return { level: 3, label: "Good",  color: "bg-blue-500",   width: "w-3/4" };
  return           { level: 4, label: "Strong", color: "bg-green-500",  width: "w-full" };
}

function PasswordStrengthBar({ password }) {
  const strength = getPasswordStrength(password);

  if (!strength) return null;

  const labelColor = {
    0: "text-red-500",
    1: "text-orange-400",
    2: "text-yellow-500",
    3: "text-blue-500",
    4: "text-green-500",
  }[strength.level];

  return (
    <div className="flex flex-col gap-1 mt-0.5">
      <div className="w-full h-1.5 bg-gray-200 rounded-full overflow-hidden">
        <div
          className={`h-full rounded-full transition-all duration-300 ${strength.color} ${strength.width}`}
        />
      </div>
      <p className={`text-[10px] font-medium text-right leading-none ${labelColor}`}>
        {strength.label}
      </p>
    </div>
  );
}

export default PasswordStrengthBar;