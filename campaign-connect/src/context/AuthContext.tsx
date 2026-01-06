"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useToast } from "@/hooks/use-toast";

interface User {
	id: string;
	donor_id?: string;
	charity_id?: string; // Standardized lowercase
	Charity_id?: string; // Maintain for safety during transition
	email: string;
	first_name: string;
	last_name: string;
	name?: string; // Keep for fallback if name is present but first_name isn't
	role: string;
	userType?: string; // 'donor' | 'charity' | 'admin'
	verified_status?: string;
	'Verified Status'?: boolean; // Maintain for safety during transition
}

interface AuthContextType {
	user: User | null;
	isLoading: boolean;
	login: (userData: User, token?: string) => void;
	logout: () => void;
}

const AuthContext = createContext<AuthContextType>({
	user: null,
	isLoading: true,
	login: () => { },
	logout: () => { },
});

export const useAuth = () => useContext(AuthContext);

export function AuthProvider({ children }: { children: React.ReactNode }) {
	const [user, setUser] = useState<User | null>(null);
	const [isLoading, setIsLoading] = useState(true);
	const router = useRouter();
	const pathname = usePathname();
	const { toast } = useToast();

	// Load user from local storage on mount
	useEffect(() => {
		const storedUser = localStorage.getItem("user");
		if (storedUser) {
			try {
				setUser(JSON.parse(storedUser));
			} catch (e) {
				console.error("Failed to parse user from local storage");
				localStorage.removeItem("user");
			}
		}
		setIsLoading(false);
	}, []);

	// RBAC Protection
	useEffect(() => {
		if (isLoading) return;

		// Define protected routes and allowed roles
		const protectedRoutes = [
			{ path: "/dashboard/admin", allowed: ["admin"] },
			{ path: "/dashboard/charity", allowed: ["charity"] },
			{ path: "/dashboard/donor", allowed: ["donor"] },
		];

		const currentProtection = protectedRoutes.find(r => pathname?.startsWith(r.path));

		if (currentProtection) {
			if (!user) {
				// Not logged in, redirect to login
				toast({ title: "Access Denied", description: "Please login to access this page.", variant: "destructive" });
				router.push("/auth/login");
			} else {
				// Logged in, check role
				// Normalize role/userType. Some parts of app use userType, some use role.
				const userRole = (user.userType || user.role || "").toLowerCase();

				if (!currentProtection.allowed.includes(userRole)) {
					toast({ title: "Access Denied", description: "You do not have permission to view this page.", variant: "destructive" });

					// Redirect to their correct dashboard
					if (userRole === "donor") router.push("/dashboard/donor");
					else if (userRole === "charity") router.push("/dashboard/charity");
					else if (userRole === "admin") router.push("/dashboard/admin");
					else router.push("/");
				}
			}
		}
	}, [pathname, user, isLoading, router, toast]);

	const login = (userData: User, token?: string) => {
		setUser(userData);
		localStorage.setItem("user", JSON.stringify(userData));
		if (token) localStorage.setItem("token", token);

		const displayName = userData.first_name ? `${userData.first_name} ${userData.last_name || ''}`.trim() : userData.name;
		toast({ title: "Welcome back!", description: `Logged in as ${displayName}` });

		// Redirect based on role
		const userRole = (userData.userType || userData.role || "").toLowerCase();
		if (userRole === "donor") router.push("/dashboard/donor");
		else if (userRole === "charity") router.push("/dashboard/charity");
		else if (userRole === "admin") router.push("/dashboard/admin");
		else router.push("/");
	};

	const logout = () => {
		setUser(null);
		localStorage.removeItem("user");
		localStorage.removeItem("token");
		localStorage.removeItem("rememberMe");

		toast({ title: "Logged Out", description: "Successfully logged out" });
		router.push("/auth/login");
	};

	return (
		<AuthContext.Provider value={{ user, isLoading, login, logout }}>
			{children}
		</AuthContext.Provider>
	);
}
