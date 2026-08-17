import { Header } from "@/components/Header";

interface ProfileHeaderProps {
  patientName: string;
  patientEmail: string;
  language: string;
}

function UserAvatar({ letter }: { letter: string }) {
  const avatarStyle =
    "w-12 h-12 rounded-2xl bg-brand-green text-white font-bold " +
    "text-base flex items-center justify-center shadow-xs uppercase";

  return <div className={avatarStyle}>{letter}</div>;
}

function UserInfo({ name, email }: { name: string; email: string }) {
  return (
    <div>
      <h2 className="text-lg font-bold text-brand-text">{name}</h2>
      <p className="text-xs text-brand-subtle">{email}</p>
    </div>
  );
}

export function ProfileHeader({
  patientName,
  patientEmail,
  language,
}: ProfileHeaderProps) {
  const letter = (patientName.trim() || patientEmail.trim()).charAt(0);
  const emailDisplay =
    patientEmail ||
    (language === "am" ? "የተጠቃሚ መለያ" : "Enat Care User");

  return (
    <div className="relative pt-16 px-6 sm:px-7">
      <Header />
      <div className="flex items-center gap-3.5 mt-2">
        <UserAvatar letter={letter} />
        <UserInfo name={patientName} email={emailDisplay} />
      </div>
    </div>
  );
}