import { useState } from "react"
import { Eye, EyeOff } from "lucide-react"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"

export function PasswordInput({
    activeTab,
    formData,
    setFormData,
    loginData,
    setLoginData,
}: {
    activeTab: string
    formData: { password: string }
    setFormData: (data: any) => void
    loginData: { password: string }
    setLoginData: (data: any) => void
}) {
    const [showPassword, setShowPassword] = useState(false)

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (activeTab === "signup") {
            setFormData({ ...formData, password: e.target.value })
        } else {
            setLoginData({ ...loginData, password: e.target.value })
        }
    }

    return (
        <div>
            <Label htmlFor="password">Mot de passe *</Label>
            <Input
                id="password"
                type={showPassword ? "text" : "password"}
                placeholder="Saisis ton mot de passe"
                value={activeTab === "signup" ? formData.password : loginData.password}
                onChange={handleChange}
                required
                className="mt-1 pr-10" // padding pour l'icône
            />
            <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 flex items-center">
                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
            </button>
        </div>
    )
}