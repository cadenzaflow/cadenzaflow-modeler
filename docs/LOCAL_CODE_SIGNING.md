# Local Code Signing Setup

Instructions to sign CadenzaFlow Modeler installers when building on your machine (Windows or Mac).

---

## Windows: Azure Trusted Signing

### 1. Create an Azure account
- Go to [https://azure.microsoft.com](https://azure.microsoft.com)
- Sign in or create a free account

### 2. Create Azure Trusted Signing resource
- In Azure Portal: **Create a resource** → search **"Trusted Signing"**
- Choose **Trusted Signing** (Microsoft) → **Create**
- Pick subscription, resource group, region (e.g. East US), name
- **Pricing tier:** Basic (Public Trust) — ~$9.99/month
- Create the resource

### 3. Create a Certificate Profile
- Open your **Trusted Signing** resource
- Go to **Certificate profiles** → **Add**
- **Profile type:** Code signing
- **Subject name:** Your company/app name (e.g. `CadenzaFlow`)
- **Validity:** 12 months (or as needed)
- Complete identity validation (business/organization details as required by Microsoft)
- After approval, note the **Certificate profile name** (e.g. `myCodeSigningProfile`)

### 4. Create an App Registration (for API access)
- In Azure Portal: **Microsoft Entra ID** (or Azure Active Directory) → **App registrations** → **New registration**
- Name: e.g. `CadenzaFlow-Signing`
- Supported account type: **Single tenant**
- Register
- Note: **Application (client) ID** and **Directory (tenant) ID**

### 5. Create a client secret
- In your App registration: **Certificates & secrets** → **New client secret**
- Description: e.g. `Code signing`
- Expiry: 24 months (or as needed)
- Add → **Copy the Value** (you won’t see it again)

### 6. Grant the app access to Trusted Signing
- Open your **Trusted Signing** resource → **Access control (IAM)** → **Add** → **Add role assignment**
- Role: **Code Signing Certificate User** (or **Contributor** if that’s what your subscription offers)
- Assign access to: **User, group, or service principal** → select your app (e.g. `CadenzaFlow-Signing`)
- Save

### 7. Get the signing endpoint URL
- In your **Trusted Signing** resource, open **Overview**
- Copy the **Endpoint** (e.g. `https://eus.codesigning.azure.net`)

### 8. Set environment variables (Windows PowerShell)

Run these in PowerShell **before** building (replace with your values):

```powershell
$env:AZURE_CERT_PROFILE_NAME = "YOUR_CERTIFICATE_PROFILE_NAME"
$env:AZURE_ENDPOINT = "https://YOUR_REGION.codesigning.azure.net"
$env:AZURE_CODE_SIGNING_NAME = "YOUR_TRUSTED_SIGNING_ACCOUNT_NAME"
$env:AZURE_PUBLISHER_NAME = "Your Company Name"
$env:AZURE_CLIENT_ID = "YOUR_APP_CLIENT_ID"
$env:AZURE_CLIENT_SECRET = "YOUR_CLIENT_SECRET"
$env:AZURE_TENANT_ID = "YOUR_TENANT_ID"
```

**Where to find them:**
- `AZURE_CODE_SIGNING_NAME` = Trusted Signing resource **name** (Overview page)
- Others = from App registration and Certificate profile steps above

### 9. Build the signed Windows installer

```powershell
cd c:\cadenzaflow-modeler
npm run build -- --win
```

The NSIS installer in `dist\` will be signed. Users will not see SmartScreen warnings (after your certificate has normal reputation).

---

## macOS: Apple Developer ID

### 1. Enroll in Apple Developer Program
- Go to [https://developer.apple.com/programs/](https://developer.apple.com/programs/)
- Enroll ($99/year)
- Complete verification

### 2. Create a Developer ID Application certificate
- [Apple Developer → Certificates, Identifiers & Profiles](https://developer.apple.com/account/resources/certificates/list)
- **Certificates** → **+** → **Developer ID Application** → Continue
- Create a Certificate Signing Request (CSR) on your Mac (Keychain Access → Certificate Assistant → Request a Certificate From a Certificate Authority)
- Upload the CSR and download the certificate
- Double-click to install in Keychain

### 3. Create an App-specific password (for notarization)
- [Apple ID account page](https://appleid.apple.com) → Sign-In and Security → **App-Specific Passwords**
- Generate a new password for “CadenzaFlow Modeler” or “Notarization”
- Save this password; you’ll use it as `APPLE_DEVELOPER_ID_PASSWORD`

### 4. Get your Team ID and Developer ID
- [Developer → Membership](https://developer.apple.com/account#MembershipDetailsCard) → **Team ID**
- In Keychain Access, find your **Developer ID Application** certificate → note the **name** (e.g. `Developer ID Application: Your Name (TEAM_ID)`)

### 5. Set environment variables (Mac terminal)

```bash
export APPLE_DEVELOPER_ID="Developer ID Application: Your Name (TEAM_ID)"
export APPLE_DEVELOPER_ID_PASSWORD="your-app-specific-password"
export APPLE_TEAM_ID="YOUR_TEAM_ID"
```

### 6. Build the signed and notarized Mac app

```bash
cd /path/to/cadenzaflow-modeler
npm run build -- --mac
```

The `.dmg` in `dist/` will be signed and notarized (if `after-sign` notarization is configured).

---

## Optional: Use a `.env` file (do not commit)

To avoid retyping, you can use a local `.env` file and load it only when building.

1. Create `.env` in the project root (add `.env` to `.gitignore` if not already).
2. Put one variable per line, e.g.:

**Windows (.env):**
```
AZURE_CERT_PROFILE_NAME=your-profile-name
AZURE_ENDPOINT=https://eus.codesigning.azure.net
AZURE_CODE_SIGNING_NAME=your-account-name
AZURE_PUBLISHER_NAME=Your Company
AZURE_CLIENT_ID=...
AZURE_CLIENT_SECRET=...
AZURE_TENANT_ID=...
```

**Mac (.env):**
```
APPLE_DEVELOPER_ID=Developer ID Application: Your Name (TEAM_ID)
APPLE_DEVELOPER_ID_PASSWORD=...
APPLE_TEAM_ID=...
```

3. Load and build:

**PowerShell (Windows):**
```powershell
Get-Content .env | ForEach-Object { if ($_ -match '^([^#=]+)=(.*)$') { [Environment]::SetEnvironmentVariable($matches[1].Trim(), $matches[2].Trim(), 'Process') } }
npm run build -- --win
```

**Bash (Mac):**
```bash
set -a; source .env; set +a
npm run build -- --mac
```

---

## Summary

| Platform | Certificate        | Env vars / secrets     | Build command           |
|----------|--------------------|------------------------|-------------------------|
| Windows  | Azure Trusted Signing | `AZURE_*` (7 vars)   | `npm run build -- --win`  |
| macOS    | Apple Developer ID | `APPLE_DEVELOPER_ID*`, `APPLE_TEAM_ID` | `npm run build -- --mac`   |

Start with the platform you’re on (Windows → Azure; Mac → Apple), then add the other when you need it.
