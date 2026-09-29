import { useState } from 'react'
import { Link } from 'react-router-dom'
import { ArrowLeft, Loader2 } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { AuthSplitLayout } from '@/features/auth/components/AuthBrandingPanel'
import { PasswordField } from '@/features/auth/components/PasswordField'
import { useRegisterVendor } from '@/features/auth/hooks/useAuthQueries'
import { FormBanner } from '@/components/feedback/FormBanner'
import { toRegisterVendorRequest, type VendorSignupForm } from '@/features/auth/utils/authFormMappers'


export function SignupVendor() {
  const registerMutation = useRegisterVendor()
  const [step, setStep] = useState(1)


  const [formData, setFormData] = useState<VendorSignupForm>({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: '',
    vendorName: '',
    companyRegistrationNumber: '',
    phone: '',
    street: '',
    city: '',
    state: '',
    postalCode: '',
    country: '',
  })

  const update = (patch: Partial<typeof formData>) => {
    registerMutation.reset()
    setFormData((prev) => ({ ...prev, ...patch }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (step === 1) {
      if (formData.password !== formData.confirmPassword) {
        return
      }
      setStep(2)
      return
    }

    const payload = toRegisterVendorRequest(formData)
    registerMutation.mutate({ payload })
  }

  return (
    <AuthSplitLayout brandingVariant="vendor">
      <Card className="border-border bg-card">
        <CardHeader className="space-y-1">
          <div className="flex items-center gap-2">
            {step === 2 ? (
              <button type="button" onClick={() => setStep(1)} className="text-muted-foreground hover:text-foreground">
                <ArrowLeft className="h-5 w-5" />
              </button>
            ) : (
              <Link to="/signup" className="text-muted-foreground hover:text-foreground">
                <ArrowLeft className="h-5 w-5" />
              </Link>
            )}
            <div>
              <CardTitle className="text-2xl">
                {step === 1 ? 'Vendor account' : 'Business details'}
              </CardTitle>
              <CardDescription>
                {step === 1 ? 'Create your vendor credentials' : 'Tell us about your service business'}
              </CardDescription>
            </div>
          </div>
          <div className="flex gap-2 pt-2">
            <div className={`h-1 flex-1 rounded-full ${step >= 1 ? 'bg-primary' : 'bg-secondary'}`} />
            <div className={`h-1 flex-1 rounded-full ${step >= 2 ? 'bg-primary' : 'bg-secondary'}`} />
          </div>
        </CardHeader>
        <CardContent>
          {registerMutation.error && (
            <FormBanner error={registerMutation.error} className="mb-4" />
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {step === 1 ? (
              <>
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-2">
                    <Label htmlFor="firstName">First name</Label>
                    <Input id="firstName" value={formData.firstName} onChange={(e) => update({ firstName: e.target.value })} required autoFocus className="bg-secondary" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="lastName">Last name</Label>
                    <Input id="lastName" value={formData.lastName} onChange={(e) => update({ lastName: e.target.value })} required className="bg-secondary" />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-2">
                    <Label htmlFor="email">Business email</Label>
                    <Input id="email" type="email" value={formData.email} onChange={(e) => update({ email: e.target.value })} required className="bg-secondary" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="phone">Phone number</Label>
                    <Input id="phone" type="tel" value={formData.phone} onChange={(e) => update({ phone: e.target.value })} required placeholder="+1234567890" className="bg-secondary" />
                  </div>
                </div>
                <PasswordField id="password" value={formData.password} onChange={(password) => update({ password })} placeholder="Create a strong password" showStrength />
                <PasswordField
                  id="confirmPassword"
                  label="Confirm password"
                  value={formData.confirmPassword}
                  onChange={(confirmPassword) => update({ confirmPassword })}
                  placeholder="Confirm your password"
                  error={
                    formData.confirmPassword && formData.password !== formData.confirmPassword
                      ? 'Passwords do not match'
                      : undefined
                  }
                />
              </>
            ) : (
              <>
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-2">
                    <Label htmlFor="vendorName">Business / Vendor name</Label>
                    <Input id="vendorName" value={formData.vendorName} onChange={(e) => update({ vendorName: e.target.value })} required className="bg-secondary" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="companyRegistrationNumber">Reg. Number (Optional)</Label>
                    <Input id="companyRegistrationNumber" value={formData.companyRegistrationNumber} onChange={(e) => update({ companyRegistrationNumber: e.target.value })} placeholder="e.g. RC-123456" className="bg-secondary" />
                  </div>
                </div>


                <div className="space-y-2 pt-2">
                  <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Business Address (Optional)</Label>
                  <div className="grid grid-cols-2 gap-3">
                    <Input id="street" placeholder="Street address" value={formData.street} onChange={(e) => update({ street: e.target.value })} className="bg-secondary" />
                    <Input id="city" placeholder="City" value={formData.city} onChange={(e) => update({ city: e.target.value })} className="bg-secondary" />
                    <Input id="state" placeholder="State/Province" value={formData.state} onChange={(e) => update({ state: e.target.value })} className="bg-secondary" />
                    <Input id="postalCode" placeholder="Postal code" value={formData.postalCode} onChange={(e) => update({ postalCode: e.target.value })} className="bg-secondary" />
                    <Input id="country" placeholder="Country" value={formData.country} onChange={(e) => update({ country: e.target.value })} className="bg-secondary col-span-2" />
                  </div>
                </div>
              </>
            )}

            <Button type="submit" className="w-full" disabled={registerMutation.isPending}>
              {registerMutation.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Creating account...
                </>
              ) : step === 1 ? (
                'Continue'
              ) : (
                'Create Vendor Account'
              )}
            </Button>
          </form>

          {step === 1 && (
            <p className="mt-6 text-center text-sm text-muted-foreground">
              Already have an account?{' '}
              <Link to="/login" className="text-primary hover:underline">
                Sign in
              </Link>
            </p>
          )}
        </CardContent>
      </Card>
    </AuthSplitLayout>
  )
}
