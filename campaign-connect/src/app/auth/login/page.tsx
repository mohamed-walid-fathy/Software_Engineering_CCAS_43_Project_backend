"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Layout } from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Checkbox } from "@/components/ui/checkbox";
import { Heart, Mail, Lock, Eye, EyeOff, Loader2, Building2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { authApi } from "@/lib/api";
import { useAuth } from "@/context/AuthContext";

export default function Login() {
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState("");
  const [adminId, setAdminId] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [loginMode, setLoginMode] = useState<"standard" | "admin">("standard");
  const { toast } = useToast();
  const router = useRouter();
  const { login: authLogin } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validation
    if (loginMode === "standard" && (!email || !password)) {
      toast({
        title: "Validation Error",
        description: "Please enter both email and password",
        variant: "destructive",
      });
      return;
    }

    if (loginMode === "admin" && (!adminId || !password)) {
      toast({
        title: "Validation Error",
        description: "Please enter both Admin ID and password",
        variant: "destructive",
      });
      return;
    }

    if (loginMode === "standard" && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      toast({
        title: "Invalid Email",
        description: "Please enter a valid email address",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);

    try {
      const loginIdentifier = loginMode === "standard" ? email : adminId;
      console.log(`Attempting ${loginMode} login with:`, loginIdentifier);

      // Call Express backend through api helper
      const result = await authApi.login(loginIdentifier, password);

      console.log("Full login result:", JSON.stringify(result, null, 2));
      console.log("result.data:", result.data);

      if (result.error) {
        throw new Error(result.error);
      }

      // ✅ FIX: Backend returns { data: { user: {...} } }
      const anyResult = result as any;
      const userData = anyResult.data?.data?.user || anyResult.data?.user;

      console.log("Extracted userData:", userData);

      if (!userData) {
        console.error("No user data found. Full result:", result);
        throw new Error("No user data returned from server");
      }

      const displayName = userData.first_name ? `${userData.first_name} ${userData.last_name || ''}`.trim() : (userData.name || 'User');
      toast({
        title: "Login Successful",
        description: `Welcome back, ${displayName}!`,
      });

      // Store user data in localStorage
      const userToStore = {
        ...userData,
        email: userData.email,
        role: userData.role || 'donor',
        donor_id: userData.donor_id,
        charity_id: userData.charity_id,
        first_name: userData.first_name,
        last_name: userData.last_name,
        name: userData.first_name ? `${userData.first_name} ${userData.last_name || ''}`.trim() : userData.name
      };

      console.log("Storing user:", userToStore);

      localStorage.setItem("user", JSON.stringify(userToStore));

      if (rememberMe) {
        localStorage.setItem("rememberMe", "true");
        localStorage.setItem("userEmail", email);
      } else {
        localStorage.removeItem("rememberMe");
        localStorage.removeItem("userEmail");
      }

      // Small delay for toast to show
      await new Promise(resolve => setTimeout(resolve, 500));

      // Use AuthContext to manage login state and redirection
      authLogin(userToStore);

    } catch (error) {
      console.error("Login error:", error);

      toast({
        title: "Login Failed",
        description: error instanceof Error ? error.message : "Invalid email or password. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Load saved email if "Remember Me" was checked
  useState(() => {
    const savedEmail = localStorage.getItem("userEmail");
    const savedRememberMe = localStorage.getItem("rememberMe");

    if (savedRememberMe === "true" && savedEmail) {
      setEmail(savedEmail);
      setRememberMe(true);
    }
  });

  return (
    <Layout>
      <div className="container flex min-h-[calc(100vh-200px)] items-center justify-center py-12">
        <div className="w-full max-w-md">
          <div className="mb-8 text-center">
            <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-xl bg-primary">
              <Heart className="h-7 w-7 text-primary-foreground" />
            </div>
            <h1 className="text-2xl font-bold">Welcome Back</h1>
            <p className="text-muted-foreground">Sign in to your GiveHope account</p>
          </div>

          <Card>
            <Tabs defaultValue="standard" className="w-full" onValueChange={(v) => setLoginMode(v as any)}>
              <CardHeader className="space-y-1 pb-4">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-xl">Sign In</CardTitle>
                </div>
                <CardDescription>
                  Enter your credentials to access your account
                </CardDescription>
                <TabsList className="grid w-full grid-cols-2 mt-2">
                  <TabsTrigger value="standard">Standard</TabsTrigger>
                  <TabsTrigger value="admin">Admin</TabsTrigger>
                </TabsList>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <TabsContent value="standard" className="space-y-4 mt-0">
                    <div className="space-y-2">
                      <Label htmlFor="email">Email</Label>
                      <div className="relative">
                        <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                        <Input
                          id="email"
                          type="email"
                          placeholder="john@example.com"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          className="pl-10"
                          required={loginMode === "standard"}
                          autoComplete="email"
                          disabled={isLoading}
                        />
                      </div>
                    </div>
                  </TabsContent>

                  <TabsContent value="admin" className="space-y-4 mt-0">
                    <div className="space-y-2">
                      <Label htmlFor="adminId">Admin ID</Label>
                      <div className="relative">
                        <Building2 className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                        <Input
                          id="adminId"
                          type="text"
                          placeholder="Admin-001"
                          value={adminId}
                          onChange={(e) => setAdminId(e.target.value)}
                          className="pl-10"
                          required={loginMode === "admin"}
                          autoComplete="username"
                          disabled={isLoading}
                        />
                      </div>
                    </div>
                  </TabsContent>

                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label htmlFor="password">Password</Label>
                      {loginMode === "standard" && (
                        <Link
                          href="/auth/forgot-password"
                          className="text-xs text-primary hover:underline"
                          tabIndex={-1}
                        >
                          Forgot password?
                        </Link>
                      )}
                    </div>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                      <Input
                        id="password"
                        type={showPassword ? "text" : "password"}
                        placeholder="••••••••"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="pl-10 pr-10"
                        required
                        autoComplete="current-password"
                        disabled={isLoading}
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                        tabIndex={-1}
                        disabled={isLoading}
                      >
                        {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>
                  </div>

                  {loginMode === "standard" && (
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="remember"
                        checked={rememberMe}
                        onCheckedChange={(checked) => setRememberMe(checked as boolean)}
                        disabled={isLoading}
                      />
                      <Label htmlFor="remember" className="text-sm font-normal cursor-pointer">
                        Remember me for 30 days
                      </Label>
                    </div>
                  )}

                  <Button type="submit" className="w-full" disabled={isLoading}>
                    {isLoading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Signing In...
                      </>
                    ) : (
                      "Sign In"
                    )}
                  </Button>
                </form>
              </CardContent>

              {loginMode === "standard" ? (
                <CardFooter className="flex flex-col gap-4 border-t pt-6">
                  <div className="relative w-full">
                    <div className="absolute inset-0 flex items-center">
                      <span className="w-full border-t" />
                    </div>
                    <div className="relative flex justify-center text-xs uppercase">
                      <span className="bg-card px-2 text-muted-foreground">Or continue with</span>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <Button variant="outline" type="button" disabled>
                      <svg className="mr-2 h-4 w-4" viewBox="0 0 24 24">
                        <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                        <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                        <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                        <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                      </svg>
                      Google
                    </Button>
                    <Button variant="outline" type="button" disabled>
                      <svg className="mr-2 h-4 w-4" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                      </svg>
                      Facebook
                    </Button>
                  </div>
                  <p className="text-center text-sm text-muted-foreground">
                    Don't have an account?{" "}
                    <Link href="/auth/register" className="font-medium text-primary hover:underline">
                      Sign up
                    </Link>
                  </p>
                </CardFooter>
              ) : (
                <CardFooter className="flex flex-col gap-4 border-t pt-6 bg-muted/5">
                  <p className="text-center text-xs text-muted-foreground">
                    This access is restricted to authorized platform administrators only.
                  </p>
                </CardFooter>
              )}
            </Tabs>
          </Card>
        </div>
      </div>
    </Layout>
  );
}
