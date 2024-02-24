import { SignIn } from "@clerk/remix";
import { useParams } from "@remix-run/react";

export default function SignInPage() {
  const redirectUrl = useParams().redirectUrl || "/";

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
