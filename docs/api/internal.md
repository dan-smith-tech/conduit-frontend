# Conduit Internal API

This document details the endpoints that this app communicates with in order to handle authentication, storage of files, and machine learning model inferencing. The API is structured in a way that allows any server could be used, so long as it hosts these endpoints and provides the following interfaces.

The endpoints in this document are hosted by the server `process.env.NEXT_PUBLIC_INTERNAL_API_URL` (a server address set as an environment variable in the file `.env.local` in the root directory of this project).

> **A note about authentication**:
>
> This document is written with the assumption that authentication is desired, and it therefore include response statuses and cookie direction that are relevant for authentication to be implemented. However, the server does not _need_ to implement authentication (it simply needs to host these endpoints accepting the documented requests, and returning the documented success responses), and can simply ignore the cookie and status code authentication direction if desired.
>
> However, this frontend already supports all endpoints without authentication, so `process.env.NEXT_PUBLIC_INTERNAL_API_URL` could simply be set to `http://localhost:3000/api` in this case, which could of course be modified to for the particular use case.

## `/auth/register` : `POST`

Sends an email to the user, with a link to `/auth/register/:uid` (where `uid` is an encoded version of their email address) for them to create an account.

### Request

_Body:_

```json
{
	"email": "string"
}
```

### Response

#### 202

The email was sent to the user.

#### 400

The client did not provide the correct data, and the email was not sent.

## `/auth/register/:uid` : `POST`

Creates a user, and generates a JWT with the user's email address as the payload.

### Request

The `uid` in the route is the encoded email address of the user.

_Body:_

```json
{
	"username": "string",
	"password": "string"
}
```

### Response

#### 201

The user was created, and the JWT was generated.

A JWT is generated and set as a cookie called `jwt` with the following attributes:

-  `http-only` : `true`
-  `same-site` : `None`
-  `domain` : `.<common_subdomain>`
-  `secure` : `true`

#### 400

The client did not provide the correct data, and the user was not created.

## `/auth/login` : `POST`

Authenticates a user, and creates a JWT with the user's email address as the payload.

### Request

_Body:_

```json
{
	"email": "string",
	"password": "string"
}
```

### Response

#### 200

The user was authenticated, and the JWT was generated.

A JWT is generated and set as a cookie called `jwt` with the following attributes:

-  `http-only` : `true`
-  `same-site` : `None`
-  `domain` : `.<common_subdomain>`
-  `secure` : `true`

#### 400

The client did not provide the correct data, and the user was not authenticated.

## `/auth/forgot` : `POST`

Sends an email to the user, with a link to `/auth/forgot/:uid` (where `uid` is an encoded version of their email address) for them to reset their password.

### Request

_Body:_

```json
{
	"email": "string"
}
```

### Response

#### 202

The email was sent to the user.

#### 400

The client did not provide the correct data, and the email was not sent.

## `/auth/forgot/:uid` : `POST`

Resets a user's password.

### Request

The `uid` in the route is the encoded email address of the user.

_Body:_

```json
{
	"password": "string"
}
```

### Response

#### 200

The user's password was reset.

#### 400

The client did not provide the correct data, and the user's password was not reset.

#### 410

The client provided the correct data, but the link had expired, so the user's password was not reset. 

## `/auth/logout` : `GET`

De-authenticates a user, and removes the JWT cookie.

### Response

#### 200

The user was de-authenticated, and the JWT cookie was removed.

#### 401

There was no authenticated user to de-authenticate.

## `/store/docs` : `GET`

Retrieves all docs for the authenticated user.

### Request

A JWT cookie must be set as an `http-only` cookie called `jwt`, as per the [register](#authregisteruid--post) and [login](#authlogin--post) endpoints.

### Response

#### 200

The docs were retrieved.

_Body:_

```json
{
	"docs": [
		{
			"uid": "string",
			"title": "string",
			"body": "Object[]",
			"created": "Date",
			"modified": "Date"
		}
	]
}
```

#### 401

There was no authenticated user to retrieve docs for.

## `/store/docs` : `POST`

Creates a new doc for the authenticated user.

### Request

A JWT cookie must be set as an `http-only` cookie called `jwt`, as per the [register](#authregisteruid--post) and [login](#authlogin--post) endpoints.

_Body:_

```json
{
	"doc": {
		"title": "string",
		"body": "Object[]"
	}
}
```

### Response

#### 201

The doc was created.

_Body:_

```json
{
	"doc": {
		"uid": "string",
		"created": "Date",
		"modified": "Date"
	}
}
```

> **Note**:
>
> The `uid` of the doc must be unique, and the `created` and `modified` fields are automatically set by the server.

#### 400

The client did not provide the correct data, and the doc was not created.

#### 401

There was no authenticated user to create a doc for.

## `/store/docs/:uid` : `GET`

Retrieves a specific doc.

### Request

A JWT cookie must be set as an `http-only` cookie called `jwt`, as per the [register](#authregisteruid--post) and [login](#authlogin--post) endpoints.

The `uid` in the route is the unique identifier of the doc.

### Response

#### 200

The doc was retrieved.

_Body:_

```json
{
	"doc": {
		"uid": "string",
		"title": "string",
		"body": "Object[]",
		"created": "Date",
		"modified": "Date"
	}
}
```

#### 401

There was no authenticated user to retrieve the doc for.

#### 404

The doc was not found.

## `/store/docs/:uid` : `PUT`

Updates a specific doc for the authenticated user.

### Request

A JWT cookie must be set as an `http-only` cookie called `jwt`, as per the [register](#authregisteruid--post) and [login](#authlogin--post) endpoints.

The `uid` in the route is the unique identifier of the doc.

_Body:_

```json
{
	"doc": {
		"title": "string",
		"body": "Object[]"
	}
}
```

### Response

#### 200

The doc was updated.

_Body:_

```json
{
	"doc": {
		"modified": "Date"
	}
}
```

#### 400

The client did not provide the correct data, and the doc was not updated.

#### 401

There was no authenticated user to update the doc for.

#### 404

The doc was not found.

## `/store/docs/:uid` : `DELETE`

Removes a specific doc from the authenticated user.

### Request

A JWT cookie must be set as an `http-only` cookie called `jwt`, as per the [register](#authregisteruid--post) and [login](#authlogin--post) endpoints.

The `uid` in the route is the unique identifier of the doc.

### Response

#### 200

The doc was removed.

#### 401

There was no authenticated user to remove the doc for.

#### 404

The doc was not found.

## `/prompts` : `GET`

Returns a list of the logged-in user's custom prompts.

### Request

A JWT cookie must be set as an `http-only` cookie called `jwt`, as per the [register](#authregisteruid--post) and [login](#authlogin--post) endpoints.

### Response

#### 200

The prompt list was successfully retrieved and returned.

```json
[
	{
		"uid": "string"
		"name": "string",
		"prompt": "string"
	}
]
```

#### 400

The request was formatted incorrectly and no prompt list could be retrieved.

#### 401

There was no authenticated user to retrieve a prompt list for.

## `/prompts` : `POST`

Adds a prompt to the logged-in user's custom prompts.

### Request

A JWT cookie must be set as an `http-only` cookie called `jwt`, as per the [register](#authregisteruid--post) and [login](#authlogin--post) endpoints.

Prompt names must be unique.

```json
{
	"name": "string",
	"prompt": "string"
}
```

### Response

#### 201

The prompt was successfully added.

#### 400

The request was incorrect and the prompt was not added. This may have been due to missing fields, or a duplicate prompt name (which is forbidden).

#### 401

There was no authenticated user to add a prompt for.

## `/prompts/:uid` : `GET`

Returns details of a specific prompt belonging to the logged-in user.

### Request

A JWT cookie must be set as an `http-only` cookie called `jwt`, as per the [register](#authregisteruid--post) and [login](#authlogin--post) endpoints.

### Response

#### 200

The prompt details were successfully retrieved and returned.

```json
{
	"id": "string",
	"name": "string",
	"prompt": "string"
}
```

#### 404

The requested prompt does not exist or does not belong to the authenticated user.

#### 401

There was no authenticated user to retrieve the prompt details for.

## `/prompts/:uid` : `PUT`

Updates details of a specific prompt belonging to the logged-in user.

### Request

A JWT cookie must be set as an `http-only` cookie called `jwt`, as per the [register](#authregisteruid--post) and [login](#authlogin--post) endpoints.

Prompt names must be unique.

```json
{
	"name": "string",
	"prompt": "string"
}
```

### Response

#### 200

The prompt details were successfully updated.

#### 404

The requested prompt does not exist or does not belong to the authenticated user.

#### 400

The request was incorrect and the prompt details were not updated. This may have been due to missing fields or a duplicate prompt name (which is forbidden).

#### 401

There was no authenticated user to update the prompt for.

## `/prompts/:uid` : `DELETE`

Deletes a specific prompt belonging to the logged-in user.

### Request

A JWT cookie must be set as an `http-only` cookie called `jwt`, as per the [register](#authregisteruid--post) and [login](#authlogin--post) endpoints.

### Response

#### 204

The prompt was successfully deleted.

#### 404

The requested prompt does not exist or does not belong to the authenticated user.

#### 401

There was no authenticated user to delete the prompt for.

## `/generate/text` : `POST`

Inferences a generative model to generate text, given a prompt.

### Request

A JWT cookie must be set as an `http-only` cookie called `jwt`, as per the [register](#authregisteruid--post) and [login](#authlogin--post) endpoints.

_Body:_

```json
{
	"prompt": {
		"name": "string",
		"messages": [
			{
				"role": "string",
				"content": "string"
			}
		]
	}
}
```

### Response

#### 200

The text was generated. `cost` gives the number of credits used in the API call.

_Body:_

```json
{
	"prompt": {
		"name": "string",
		"messages": [
			{
				"role": "string",
				"content": "string"
			}
		]
	}
	"cost": "float"
}
```

#### 400

The client did not provide the correct data, and the text was not generated.

#### 401

There was no authenticated user to generate text for.

## `/credits` : `GET`

Retrieves the number of API credits for an authenticated user.

### Request

A JWT cookie must be set as an `http-only` cookie called `jwt`, as per the [register](#authregisteruid--post) and [login](#authlogin--post) endpoints.

### Response

#### 200

The number of credits was returned.

_Body:_

```json
{
	"credits": "float"
}
```

#### 401

There was no authenticated user to return credits for.

## `/credits` : `POST`

Opens a Stripe payment window to be completed by the user. If successful, adds the given number of credits to the authenticated user's account. One credit is 1¢ in USD.

### Request

A JWT cookie must be set as an `http-only` cookie called `jwt`, as per the [register](#authregisteruid--post) and [login](#authlogin--post) endpoints.

_Body:_

An empty string, as required by Stripe:

```json
{ "" }
```

### Response

#### 302

The URL of the Stripe payment page. 

_Body:_

```json
{ 'redirect_url': "string" }
```

When the payment has been completed or abandoned, the user is redirected to the following URL:

```
https://app.conduits.link/settings/credits?session_id={CHECKOUT_SESSION_ID}
```

where `CHECKOUT_SESSION_ID` is a unique identifier corresponding to the payment attempt.

#### 401

There was no authenticated user to add credits for.

### 500

Stripe payment was unsuccessful.

## `/credits/:uid` : `GET`

Retrieves the number of API credits added in a given Stripe Checkout payment, or a failure message if the transaction was unsuccessful.

### Request

A JWT cookie must be set as an `http-only` cookie called `jwt`, as per the [register](#authregisteruid--post) and [login](#authlogin--post) endpoints.

### Response

#### 200

The payment was successful, and the number of credits added in the Checkout payment session was returned.

_Body:_

```json
{
	"added_credits": "float"
}
```

#### 402

The payment was unsuccessful.

#### 401

There was no authenticated user to return credits for, or a user was attempting to access another user's Stripe Checkout session.

#### 404

The uid provided did not correspond to an existing Stripe Checkout session.

> **Note**:
>
> The `uid` is given in an automatic redirect from the Stripe Checkout page, following a `POST` request to `/credits`.
