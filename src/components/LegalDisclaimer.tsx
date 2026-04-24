import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { ShieldAlert } from "lucide-react"

export default function LegalDisclaimer() {
  return (
    <Alert variant="destructive" className="bg-destructive/5 text-destructive border-destructive/20 mt-8">
      <ShieldAlert className="h-4 w-4" />
      <AlertTitle>Legal Disclaimer</AlertTitle>
      <AlertDescription className="text-xs">
        This tool provides AI-generated drafts and analysis for informational purposes only. It does not constitute legal or professional tax advice. Always consult with a qualified Chartered Accountant (CA) or tax professional before submitting any legal documents or filing returns. GSTSmartAI.com is not responsible for any inaccuracies or penalties resulting from the use of this AI output.
      </AlertDescription>
    </Alert>
  )
}
