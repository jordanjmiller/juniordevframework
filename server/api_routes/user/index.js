const { Router } = require('express');
const { v4: uuid } = require('uuid');
const {
	COOKIES: {
		COOKIE_MAX_AGE,
		KEY: COOKIE_KEY
	}
} = require('../../lib/constants');
const  {
  env: {
    REDIRECT_AUTH_URLS: redirectEnvValue = ''
  }
} = process;

const REDIRECT_AUTH_URLS = redirectEnvValue.toLowerCase() == 'true' ? true : false;

const getUserRouter = (dbFunctions, redisFunctions, credentialsObject) => {

	const userRouter = Router();

	userRouter.post('/new', async (req, res) => {

		const {
			body: {
				email,
				firstName,
				lastName
			}
		} = req;

		let userId;
		try {
			const { rows: [newUser] } = await dbFunctions.insertNewUser(email, firstName, lastName);
			userId = (newUser) ? newUser.id : null;
		} catch (err) {
			console.error('signup error:', err);

			const failMessage = 'could not create new user';
			if (REDIRECT_AUTH_URLS) {
				return res.redirect(`/?newusercreated=false&error=${failMessage.replace(/ /g, '+')}`);
			}
			return res.status(500).json({ error: failMessage });
		}

		if (REDIRECT_AUTH_URLS) {
			return res.redirect('/?newusercreated=true');
		}

		// const cookieValue = uuid();
		// res.setCookie(COOKIE_KEY, cookieValue, { maxAge: COOKIE_MAX_AGE, httpOnly: true });
		
		// try {
		// 	await redisFunctions.mapCookieAndUserId(cookieValue, userId);
		// } catch (err) {

		// }

		return res.status(200).json({ email, message: `new user ${firstName} ${lastName} created` });
	});

	return userRouter;
};

module.exports = getUserRouter;
