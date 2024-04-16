import { SignUp } from "@clerk/remix";
import { useRedirectUrl } from "~/utils/auth";

export default function SignUpPage() {
  const redirectUrl = useRedirectUrl();

  return (
    <div className="flex justify-center">
      <SignUp redirectUrl={redirectUrl} path="/signup" />
    </div>
  );
}
