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
import { Heart, Mail, Lock, Eye, EyeOff, User, Building, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { authApi } from "@/lib/api";

export default function Register() {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [accountType, setAccountType] = useState<"donor" | "charity">("donor");
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  // Donor form state
  const [donorFirstName, setDonorFirstName] = useState("");
  const [donorLastName, setDonorLastName] = useState("");
  const [donorEmail, setDonorEmail] = useState("");
  const [donorPassword, setDonorPassword] = useState("");
  const [donorPhone, setDonorPhone] = useState("");

  // Charity form state
  const [charityOrgName, setCharityOrgName] = useState("");
  const [charityEmail, setCharityEmail] = useState("");
  const [charityPassword, setCharityPassword] = useState("");
  const [charityRegNumber, setCharityRegNumber] = useState("");

  const handleDonorSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Form submitted!', { donorFirstName, donorLastName, donorEmail });
    
    // Validate required fields
    if (!donorFirstName || !donorLastName || !donorEmail || !donorPassword) {
      console.log('Validation failed:', { donorFirstName, donorLastName, donorEmail, hasPassword: !!donorPassword });
      toast({
        title: "Validation Error",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    const fullName = `${donorFirstName} ${donorLastName}`.trim();
    console.log('Submitting donor registration...', { 
      email: donorEmail, 
      name: fullName,
      phone: donorPhone,
      accountType: "donor"
    });

    try {
      const requestData = {
        email: donorEmail,
        password: donorPassword,
        name: fullName,
        phone: donorPhone || undefined,
        accountType: "donor" as const,
      };
      
      console.log('Calling authApi.register with:', { ...requestData, password: '***' });
      
      const response = await authApi.register(requestData);

      console.log('Registration response:', response);

      if (response.error) {
        toast({
          title: "Registration Failed",
          description: response.error,
          variant: "destructive",
        });
      } else {
        toast({
          title: "Account Created",
          description: "Your donor account has been created successfully!",
        });
        // Redirect to login after 2 seconds
        setTimeout(() => {
          router.push("/auth/login");
        }, 2000);
      }
    } catch (error) {
      toast({
        title: "Registration Failed",
        description: "An unexpected error occurred. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleCharitySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const response = await authApi.register({
        email: charityEmail,
        password: charityPassword,
        orgName: charityOrgName,
        registrationNumber: charityRegNumber,
        accountType: "charity",
      });

      if (response.error) {
        toast({
          title: "Registration Failed",
          description: response.error,
          variant: "destructive",
        });
      } else {
        toast({
          title: "Account Created",
          description: "Your charity account has been created successfully!",
        });
        // Redirect to login after 2 seconds
        setTimeout(() => {
          router.push("/auth/login");
        }, 2000);
      }
    } catch (error) {
      toast({
        title: "Registration Failed",
        description: "An unexpected error occurred. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    if (accountType === "donor") {
      handleDonorSubmit(e);
    } else {
      handleCharitySubmit(e);
    }
  };

  return (
    <Layout>
      <div className="container flex min-h-[calc(100vh-200px)] items-center justify-center py-12">
        <div className="w-full max-w-md">
          <div className="mb-8 text-center">
            <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-xl bg-primary">
              <Heart className="h-7 w-7 text-primary-foreground" />
            </div>
            <h1 className="text-2xl font-bold">Join GiveHope</h1>
            <p className="text-muted-foreground">Create an account to start making a difference</p>
          </div>

          <Card>
            <CardHeader className="space-y-1 pb-4">
              <CardTitle className="text-xl">Create Account</CardTitle>
              <CardDescription>
                Choose your account type and fill in your details
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Tabs value={accountType} onValueChange={setAccountType} className="w-full">
                <TabsList className="grid w-full grid-cols-2 mb-6">
                  <TabsTrigger value="donor" className="gap-2">
                    <User className="h-4 w-4" />
                    Donor
                  </TabsTrigger>
                  <TabsTrigger value="charity" className="gap-2">
                    <Building className="h-4 w-4" />
                    Charity
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="donor">
                  <form onSubmit={handleDonorSubmit} className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="firstName">First Name</Label>
                        <Input 
                          id="firstName" 
                          placeholder="John" 
                          value={donorFirstName}
                          onChange={(e) => setDonorFirstName(e.target.value)}
                          required 
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="lastName">Last Name</Label>
                        <Input 
                          id="lastName" 
                          placeholder="Doe" 
                          value={donorLastName}
                          onChange={(e) => setDonorLastName(e.target.value)}
                          required 
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="donorEmail">Email</Label>
                      <div className="relative">
                        <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                        <Input
                          id="donorEmail"
                          type="email"
                          placeholder="john@example.com"
                          className="pl-10"
                          value={donorEmail}
                          onChange={(e) => setDonorEmail(e.target.value)}
                          required
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="donorPhone">Phone (Optional)</Label>
                      <Input
                        id="donorPhone"
                        type="tel"
                        placeholder="+201012345678"
                        value={donorPhone}
                        onChange={(e) => setDonorPhone(e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="donorPassword">Password</Label>
                      <div className="relative">
                        <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                        <Input
                          id="donorPassword"
                          type={showPassword ? "text" : "password"}
                          placeholder="Create a strong password"
                          className="pl-10 pr-10"
                          value={donorPassword}
                          onChange={(e) => setDonorPassword(e.target.value)}
                          required
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                        >
                          {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </button>
                      </div>
                      <p className="text-xs text-muted-foreground">
                        Must be at least 8 characters with a number and symbol
                      </p>
                    </div>
                    <div className="flex items-start space-x-2">
                      <Checkbox id="donorTerms" required />
                      <Label htmlFor="donorTerms" className="text-sm font-normal leading-snug cursor-pointer">
                        I agree to the{" "}
                        <Link href="/" className="text-primary hover:underline">Terms of Service</Link>{" "}
                        and{" "}
                        <Link href="/" className="text-primary hover:underline">Privacy Policy</Link>
                      </Label>
                    </div>
                    <Button type="submit" className="w-full" disabled={isLoading}>
                      {isLoading ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Creating Account...
                        </>
                      ) : (
                        "Create Donor Account"
                      )}
                    </Button>
                  </form>
                </TabsContent>

                <TabsContent value="charity">
                  <form onSubmit={handleCharitySubmit} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="orgName">Organization Name</Label>
                      <div className="relative">
                        <Building className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                        <Input
                          id="orgName"
                          placeholder="Your Charity Name"
                          className="pl-10"
                          value={charityOrgName}
                          onChange={(e) => setCharityOrgName(e.target.value)}
                          required
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="charityEmail">Organization Email</Label>
                      <div className="relative">
                        <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                        <Input
                          id="charityEmail"
                          type="email"
                          placeholder="contact@charity.org"
                          className="pl-10"
                          value={charityEmail}
                          onChange={(e) => setCharityEmail(e.target.value)}
                          required
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="registrationNumber">Registration Number (Optional)</Label>
                      <Input
                        id="registrationNumber"
                        placeholder="Tax ID or Registration Number"
                        value={charityRegNumber}
                        onChange={(e) => setCharityRegNumber(e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="charityPassword">Password</Label>
                      <div className="relative">
                        <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                        <Input
                          id="charityPassword"
                          type={showPassword ? "text" : "password"}
                          placeholder="Create a strong password"
                          className="pl-10 pr-10"
                          value={charityPassword}
                          onChange={(e) => setCharityPassword(e.target.value)}
                          required
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                        >
                          {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </button>
                      </div>
                    </div>
                    <div className="flex items-start space-x-2">
                      <Checkbox id="charityTerms" required />
                      <Label htmlFor="charityTerms" className="text-sm font-normal leading-snug cursor-pointer">
                        I confirm this is a registered non-profit and agree to the{" "}
                        <Link href="/" className="text-primary hover:underline">Terms of Service</Link>
                      </Label>
                    </div>
                    <Button type="submit" className="w-full" disabled={isLoading}>
                      {isLoading ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Creating Account...
                        </>
                      ) : (
                        "Create Charity Account"
                      )}
                    </Button>
                  </form>
                </TabsContent>
              </Tabs>
            </CardContent>
            <CardFooter className="flex flex-col gap-4 border-t pt-6">
              <p className="text-center text-sm text-muted-foreground">
                Already have an account?{" "}
                <Link href="/auth/login" className="font-medium text-primary hover:underline">
                  Sign in
                </Link>
              </p>
            </CardFooter>
          </Card>
        </div>
      </div>
    </Layout>
  );
}

