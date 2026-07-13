# Security Notes

- The real backend `.env` file is intentionally excluded from Git.
- Do not commit database passwords, private keys, PEM files, access tokens, Azure credentials, Terraform state, or local Azure CLI data.
- Values in `.env.example` are placeholders only.
- Only the frontend VM should remain publicly reachable in the final architecture.
- Any temporary public IP used for backend package installation should be removed after deployment.
- For production, store secrets in Azure Key Vault and use managed identity where possible.
- Deployment screenshots in this repository have account identifiers, subscription IDs, browser URLs, and public IP addresses blurred before publication.
