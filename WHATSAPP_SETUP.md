# Spend Wise WhatsApp Integration

## What is already prepared

- Firebase Function webhook: `functions/index.js`
- Natural language parser for WhatsApp: `functions/parser.js`
- App profile card to generate a connection code.
- Firebase config now includes the `functions` source.

## User connection flow

1. In Spend Wise, open `Perfil > WhatsApp`.
2. Click `Gerar`.
3. Send this message to the WhatsApp Business number:

```
conectar CODIGO
```

After that, messages like this can create transactions:

```
paguei 89,90 no mercado hoje categoria Alimentação
recebi 300 de pix hoje categoria Salário
conta de luz 210 vence dia 12 categoria Utilidades
```

## Meta/WhatsApp setup needed later

You need to create a Meta Developers app with WhatsApp Business Platform / Cloud API and provide:

- WhatsApp Business Account ID
- Phone Number ID
- Permanent access token
- Webhook verify token chosen by us

The Firebase Function URL will be used as the webhook callback URL after deploy.

## Firebase secrets

Set these before deploying functions:

```powershell
firebase.cmd functions:secrets:set WHATSAPP_VERIFY_TOKEN
firebase.cmd functions:secrets:set WHATSAPP_TOKEN
firebase.cmd functions:secrets:set WHATSAPP_PHONE_NUMBER_ID
```

Then deploy:

```powershell
firebase.cmd deploy --only functions
```


## Twilio WhatsApp Sandbox test path

Enquanto a Meta não libera o portfólio empresarial, dá para testar pelo Twilio Sandbox.

Depois de publicar a function, use esta URL no campo `When a message comes in` da sandbox:

```
https://us-central1-appfinance-e6d2d.cloudfunctions.net/twilioWhatsappWebhook
```

Método:

```
POST
```

Fluxo:

1. Abra `Perfil > WhatsApp` no Spend Wise.
2. Gere um código.
3. Entre na sandbox da Twilio pelo WhatsApp seguindo a frase que a Twilio mostrar.
4. Envie:

```
conectar CODIGO
```

5. Depois envie lançamentos:

```
paguei 89,90 no mercado hoje categoria Alimentação
```
