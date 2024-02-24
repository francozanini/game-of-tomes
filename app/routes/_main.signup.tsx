import { SignUp } from "@clerk/remix";
import { useParams } from "@remix-run/react";

export default function SignUpPage() {
  const redirectUrl = useParams().redirectUrl || "/";

  console.log("redirectUrl", redirectUrl);
  return (
    <div className="flex justify-center">
      <SignUp redirectUrl={redirectUrl} path="/signup" />
    </div>
  );
}
