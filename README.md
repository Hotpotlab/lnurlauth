# YouFlix
LNAuth platform that acts as a subscription provider using the Bitcoin Lightning Network making it easier for companies to accept payments & subscriptions.

If you would like to learn more about our project and check out our submission, please visit [our DevPost Project Submission.](https://devpost.com/software/youflix)

## Inspiration

We were inspired by the need for companies to accept payments quickly and easily with Bitcoin. We wanted to make the Lightning Network more accessible to companies who may not have the technical expertise to use it. 

## What We Learned 

We learned a lot about the Lightning Network while building the project. We learned how the various protocols, such as LNURL, work and the challenges of using them. We also learned how to build a project using LND, LNURL, and Node.js. 

## How We Built Our Project

We built our project using lnurl-auth in combination with hosting on ngrok, a voltage node, LND Lightning API for transactions, CRON jobs for reoccurring payments and Node.js for development. Each of these components worked together to create a seamless user experience for our customers. 

## Challenges We Faced

The biggest challenge we faced was the limitation of the Lightning Network. Specifically, we ran into issues with LNURL Auth support being limited to certain wallets and the lack of support for BOLT12. We overcame this challenge by designing a workaround for the issue and ensuring that our product was reliable.
