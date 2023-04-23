const express = require("express");
const LnurlAuth = require("passport-lnurl-auth");
const passport = require("passport");
const session = require("express-session");
const cors = require("cors");
const path = require("path");
const db = require("./db");
const app = express();
const { uuid } = require("uuidv4");
const { createLnInvoice, verifyInvoice } = require("./client");

app.use(
  cors({
    origin: "http://localhost:3000",
    credentials: true,
  })
);

const config = {
  host: "localhost",
  port: 3001,
  url: null,
};

if (!config.url) {
  config.url = "http://" + config.host + ":" + config.port;
}

app.use(
  session({
    secret: "12345",
    resave: true,
    saveUninitialized: true,
  })
);

app.use(passport.initialize());
app.use(passport.session());

const map = {
  user: new Map(),
  invoice: new Map(),
};

passport.serializeUser(function (user, done) {
  done(null, user.pubkey);
});

passport.deserializeUser(function (pubkey, done) {
  if (!pubkey) {
    return done("No pubkey");
  }
  db("users")
    .select("*")
    .where({ pubkey: pubkey })
    .then((users) => {
      if (users.length === 0) {
        return done("User not found");
      }
      done(null, users[0]);
    });
  //   done(null, map.user.get(id) || null);
});

passport.use(
  new LnurlAuth.Strategy(function (linkingPublicKey, done) {
    // let user = map.user.get(linkingPublicKey);
    // if (!user) {
    //   user = { id: linkingPublicKey };
    //   map.user.set(linkingPublicKey, user);
    // }
    // done(null, user);

    db("users")
      .select("*")
      .where({ pubkey: linkingPublicKey })
      .then((users) => {
        if (users.length === 0) {
          //   console.log("deserializeUser: User not found");
          //   return done(null, false);
          // add user to database
          const frequency = 30;
          const last_paid = new Date();
          last_paid.setDate(last_paid.getDate() - frequency);
          const pubkey = linkingPublicKey;
          const id = uuid();
          db("users")
            .insert({ id, pubkey, last_paid, frequency })
            .returning("*")
            .then((users) => {
              done(null, users[0]);
            });
        }
        done(null, users[0]);
      });
  })
);

app.get("/verify/:invoice", async function (req, res) {
  if (req.user) {
    // console.log(invoice);
    // const invoice = req.params.invoice;
    // Already authenticated.
    // check if invoice is paid
    // const result = await verifyInvoice(invoice);
    // if paid, update user last_paid
    // if (result) {
    db("users")
      .where({ id: req.user.id })
      .update({ last_paid: new Date() })
      .returning("*")
      .then((users) => {
        console.log(users);
        return res.redirect("http://localhost:3000/");
      });
    // } else {
    //   return res.send("Invoice not paid");
    // }
  }
});

app.use(passport.authenticate("lnurl-auth"));
app.use(function (req, res, next) {
  if (req.user) {
    if (req.user.last_paid) {
      // check if user last paid is less than 30 days
      const last_paid = new Date(req.user.last_paid);
      console.log(last_paid);
      const today = new Date();
      console.log(today);
      const diffTime = Math.abs(today - last_paid);
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      console.log(diffDays);
      if (diffDays > req.user.frequency) {
        // user has not paid in 30 days
        // redirect to payment page

        // create invoice
        createLnInvoice().then((data) => {
          console.log(data.payment_request);
          return res.send(`
		  <head>
		 
    <style>
        h1, h3 {
        color: orange;
        }
        body, header {
        display: flex;
        flex-direction: column;
        justify-content: center;
        align-items: center;
        }
		.paragraph {
			font-size: 16px;
			line-height: 1.5;
			margin-bottom: 1em;
		  }
    </style>
    <script src=
"https://cdnjs.cloudflare.com/ajax/libs/qrcodejs/1.0.0/qrcode.min.js%22%3E">
    </script>
</head>
<body>


    <header>
        <h1>Youflix</h1>
        <h3>This is Invoice QRCode</h3>
        <h3>Please pay this invoice by your wallet</h3>
    </header>
    <main>
        <div id="qrcode"></div>
		
    </main>
		<p class="paragraph">${data.payment_request}</p>
	
		verify payment <a href="/verify/${data.r_hash}">here</a>
    <script>
        var qrcode = new QRCode("qrcode",
        ${data.payment_request});
    </script>
</body>


		  `);
        });
        // createLnInvoice(req.user.id).then((invoice) => {
        //   console.log(invoice);
        //   newInvoice = invoice;
        // });
        // return res.send(
        //   `Please pay your invoice:
        // 		  `
        // );
      } else {
        next();
      }
    }
  } else {
    next();
  }
});

app.get("/", function (req, res) {
  if (!req.user) {
    return res.send(
      'You are not authenticated. To login go <a href="/login">here</a>.'
    );
    // return res.redirect('/login');
  }
  res.send("Logged-in");
});

app.get(
  "/login",
  function (req, res, next) {
    if (req.user) {
      // Already authenticated.
      return res.redirect("http://localhost:3000/");
    }
    next();
  },
  new LnurlAuth.Middleware({
    callbackUrl: config.url + "/login",
    cancelUrl: "http://localhost:3000/",
    loginTemplateFilePath: path.join(__dirname, "login.html"),
  })
);

app.get("/user", (req, res) => {
  res.send(req.user);
});

app.get("/logout", function (req, res, next) {
  if (req.user) {
    req.session.destroy();
    res.json({ message: "user logged out" });
    // Already authenticated.
    return res.redirect("http://localhost:3000/");
  }
  next();
});

app.use("/api", require("./routes"));

const server = app.listen(config.port, config.host, function () {
  console.log("Server listening at " + config.url);
});

process.on("uncaughtException", (error) => {
  console.error(error);
});

process.on("beforeExit", (code) => {
  try {
    server.close();
  } catch (error) {
    console.error(error);
  }
  process.exit(code);
});
