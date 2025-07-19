package verifEmail

import (
	"fmt"
	"os"

	"github.com/go-resty/resty/v2"
)

func SendVerificationEmailBrevo(toEmail, name, verificationLink string) error {
	apiKey := os.Getenv("BREVO_API_KEY")

	client := resty.New()
	resp, err := client.R().
		SetHeader("accept", "application/json").
		SetHeader("api-key", apiKey).
		SetHeader("content-type", "application/json").
		SetBody(map[string]interface{}{
			"sender": map[string]string{
				"name":  "AlgoBoost",
				"email": "noreply@algoboost.foo", // must be verified in Brevo
			},
			"to": []map[string]string{
				{"email": toEmail},
			},
			"subject": "Verify your AlgoBoost email",
			"htmlContent": fmt.Sprintf(`
					<p>Helloooo dear %s,</p>
					<p>Click the link below to verify your email address & complete your registration:</p>
					<p><a href="%s">%s</a></p>
					<p>This link expires in 24 hours, so be quick.</p>
				`, name, verificationLink, verificationLink),
		}).
		Post("https://api.brevo.com/v3/smtp/email")

	if err != nil {
		return fmt.Errorf("failed to send email: %w", err)
	}

	if resp.StatusCode() >= 400 {
		return fmt.Errorf("failed to send email: %s", resp.String())
	}
	return nil
}
