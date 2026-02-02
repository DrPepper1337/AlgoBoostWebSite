package verifEmail

import (
	"fmt"
	"os"

	sendgrid "github.com/sendgrid/sendgrid-go"
	"github.com/sendgrid/sendgrid-go/helpers/mail"
)

func SendVerificationEmailSendGrid(toEmail, name, verificationLink string) error {
	from := mail.NewEmail("AlgoBoost", "noreply@algoboost.foo") // must match verified domain sender
	subject := "Verify your AlgoBoost email"
	to := mail.NewEmail("", toEmail)
	plainTextContent := fmt.Sprintf("Click to verify your email: %s", verificationLink)
	htmlContent := fmt.Sprintf(`<p>Helloooo dear %s,</p>
<p>Click the link below to verify your email address & complete your registration:</p>
<p><a href="%s">%s</a></p>
<p>This link will expire in 24 hours, so be quick.</p>`, name, verificationLink, verificationLink)

	message := mail.NewSingleEmail(from, subject, to, plainTextContent, htmlContent)

	client := sendgrid.NewSendClient(os.Getenv("SENDGRID_API_KEY"))
	response, err := client.Send(message)
	if err != nil {
		return err
	}

	if response.StatusCode >= 400 {
		return fmt.Errorf("failed to send email : %s", response.Body)
	}
	return nil
}
