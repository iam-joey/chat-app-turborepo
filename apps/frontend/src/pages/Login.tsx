import { Link, useNavigate } from "react-router-dom";
import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import axios from "axios";
import { toast } from "sonner";

export function Login() {
  const [hide, setHide] = useState(false);
  const emailRef = useRef("");
  const pwdRef = useRef("");
  const navigate = useNavigate();
  const createAnAccount = async () => {
    try {
      if (!emailRef.current || !pwdRef.current) {
        toast.warning("enter correct details");
        return;
      }
      const data = {
        email: emailRef.current,
        password: pwdRef.current,
      };
      const res = await axios.post("http://localhost:3001/api/v1/login", data, {
        withCredentials: true,
      });
      navigate("/");
      console.log(res);
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <div className="h-screen">
      <div className="h-full flex justify-center items-center">
        <Card className="mx-auto max-w-96 border-black">
          <CardHeader>
            <CardTitle className="text-xl text-center">Sign Up</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4">
              <div className="grid gap-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="m@example.com"
                  required
                  onChange={(e: any) => (emailRef.current = e.target.value)}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type={hide ? `password` : `text`}
                  onChange={(e: any) => (pwdRef.current = e.target.value)}
                />
              </div>
              <Button
                type="submit"
                className="w-full"
                onClick={createAnAccount}
              >
                Create an account
              </Button>
              <Button variant="outline" className="w-full">
                Sign up with GitHub
              </Button>
            </div>
            <div className="mt-4 text-center text-sm">
              Already have an account? <Link to="/login">Sign in</Link>
            </div>
          </CardContent>
        </Card>
      </div>

      <button onClick={() => {}}>CLick me for atom</button>
    </div>
  );
}
