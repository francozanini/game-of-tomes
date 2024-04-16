import { SignIn } from "@clerk/remix";
import { useRedirectUrl } from "~/utils/auth";

export default function SignInPage() {
  const redirectUrl = useRedirectUrl();

  return (
    <div className="flex justify-center">
      <SignIn
        redirectUrl={redirectUrl}
        path="/signin"
        routing="path"
        signUpUrl="/signup"
      />
    </div>
  );
}
