# Enquiry email setup

The website uses the official browser-side [Web3Forms submission endpoint](https://docs.web3forms.com/getting-started/api-reference). No enquiry is sent until a form access key is configured. The user will supply this later.

1. Obtain a Web3Forms form access key associated with the destination inbox, `ad@theadcompany.in`.
2. Add `VITE_WEB3FORMS_ACCESS_KEY=<the form access key>` to `.env.local` in the project root. The example file contains an empty setting. Use the public form access key, not a private management credential.
3. Restart the local Vite server. For a hosted build, set the same variable in the build environment and rebuild.
4. Manually submit an approved test enquiry and verify it arrives in the intended inbox. No live email test was performed during implementation.

Until the key is configured, the form displays a brief connection notice and its Submit enquiry button remains disabled. After configuration, a successful HTTP response with `success: true` is required before showing confirmation or clearing the form. Network errors, declined submissions and timeouts leave the visitor's input available for retry. No visitor details are saved to browser storage.
