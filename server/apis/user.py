from flask import Blueprint, request, jsonify, make_response
from datetime import datetime
from dateutil import relativedelta
from flask_jwt_extended import (
    create_access_token,
    get_jwt,
    get_jwt_identity,
    unset_jwt_cookies,
    jwt_required,
    JWTManager,
    create_refresh_token,
    set_access_cookies,
    set_refresh_cookies,
)
import json
import bcrypt

import utility
from database import getdb

user_api = Blueprint("user_api", __name__)


@user_api.route("/login", methods=["POST"])
def login():
    body = utility.convertBody(
        json.loads(request.data.decode("UTF-8")),
        {"user_type": "user_type", "username": "username", "password": "password"},
    )

    if body == False:
        return {"msg": "missing field"}, 422

    mydb = getdb()
    cursor = mydb.cursor()

    if body["user_type"] == "customer":
        cursor.execute(
            """
            SELECT password, first_name, last_name
                FROM customer
                WHERE email = %(email)s
        """,
            {"email": body["username"]},
        )

        result = cursor.fetchall()
        cursor.close()
        mydb.close()
        users = []

        for p in result:
            users.append(p)

        if len(users) == 0:
            return {"msg": "unknown user"}, 403

        if not bcrypt.checkpw(body["password"].encode("utf-8"), users[0][0].encode("utf-8")):
            return {"msg": "wrong password"}, 403

        access_token = create_access_token(identity={"type": "customer", "username": body["username"]})
        refresh_token = create_refresh_token(identity={"type": "customer", "username": body["username"]})

        response = make_response(
            jsonify(
                {
                    "type": "customer",
                    "first_name": users[0][1],
                    "last_name": users[0][2],
                    "expiration_date": (datetime.now() + relativedelta.relativedelta(hours=24)).strftime(
                        "%Y-%m-%d %H:%M:%S"
                    ),
                }
            )
        )
        set_access_cookies(response, access_token)
        set_refresh_cookies(response, refresh_token)
        response.headers["access-control-expose-headers"] = "Set-Cookie"
        response.headers["Access-Control-Allow-Origin"] = "http://localhost:3000"
        response.headers["Access-Control-Allow-Credentials"] = "true"
        response.headers["Access-Control-Allow-Headers"] = "*"

        return response

    elif body["user_type"] == "staff":
        cursor.execute(
            """
            SELECT password, airline_name
                FROM airline_staff
                WHERE username=%(username)s
        """,
            {"username": body["username"]},
        )

        result = cursor.fetchall()
        cursor.close()
        mydb.close()
        user = []

        for p in result:
            user.append(p)

        if len(user) == 0:
            return {"msg": "unknown user"}, 403

        if not bcrypt.checkpw(body["password"].encode("utf-8"), user[0][0].encode("utf-8")):
            return {"msg": "wrong password"}, 403

        access_token = create_access_token(identity={"type": "staff", "username": body["username"]})
        refresh_token = create_refresh_token(identity={"type": "staff", "username": body["username"]})

        response = make_response(
            jsonify(
                {
                    "type": "staff",
                    "airline": user[0][1],
                    "expiration_date": (datetime.now() + relativedelta.relativedelta(hours=24)).strftime(
                        "%Y-%m-%d %H:%M:%S"
                    ),
                }
            )
        )
        set_access_cookies(response, access_token)
        set_refresh_cookies(response, refresh_token)
        response.headers["access-control-expose-headers"] = "Set-Cookie"
        response.headers["Access-Control-Allow-Origin"] = "http://localhost:3000"
        response.headers["Access-Control-Allow-Credentials"] = "true"
        response.headers["Access-Control-Allow-Headers"] = "*"

        return response

    return {"msg": "unknown user type"}, 422


@user_api.route("/logout", methods=["POST"])
def logout():
    response = jsonify({"msg": "logout successful"})
    unset_jwt_cookies(response)
    return response


@user_api.route("/register", methods=["POST"])
def register():
    body = request.json
    if "register_type" not in body:
        return {"msg": "missing field"}, 422

    if body["register_type"] == "customer":
        body = utility.convertBody(
            body,
            {
                "email": "email",
                "phone_number": "phone_number",
                "first_name": "name.first_name",
                "last_name": "name.last_name",
                "password": "password",
                "building_number": "address.building_number",
                "street_name": "address.street_name",
                "apartment_number": "address.apartment_number",
                "city": "address.city",
                "state": "address.state",
                "zip_code": "address.zip_code",
                "passport_number": "passport.number",
                "passport_expiration": "passport.expiration",
                "passport_country": "passport.country",
                "date_of_birth": "date_of_birth",
            },
        )

        if body == False:
            return {"msg": "missing field"}, 422

        password = bcrypt.hashpw(body["password"].encode("utf-8"), bcrypt.gensalt())
        body["password"] = password

        mydb = getdb()
        cursor = mydb.cursor()

        cursor.execute(
            """
                SELECT email
                    FROM customer
                    WHERE email = %(email)s
            """,
            {"email": body["email"]},
        )

        if sum(1 for (_) in cursor) > 0:
            return {"msg": "email already exists"}, 409

        try:
            cursor.execute(
                """
                INSERT INTO customer VALUES (
                    %(email)s,
                    %(first_name)s,
                    %(last_name)s,
                    %(password)s,
                    %(building_number)s,
                    %(street_name)s,
                    %(apartment_number)s,
                    %(city)s,
                    %(state)s,
                    %(zip_code)s,
                    %(passport_number)s,
                    %(passport_expiration)s,
                    %(passport_country)s,
                    %(date_of_birth)s
                )
            """,
                body,
            )

            cursor.execute(
                """
                    INSERT INTO customer_phone_number
                        VALUES (
                            %(email)s,
                            %(phone_number)s
                        )
                """,
                {"email": body["email"], "phone_number": body["phone_number"]},
            )
        except:
            return {"msg": "invalid field"}, 409

        cursor.close()
        mydb.commit()
        mydb.close()

        return {"msg": "success"}

    elif body["register_type"] == "staff":
        body = utility.convertBody(
            body,
            {
                "username": "username",
                "password": "password",
                "first_name": "name.first_name",
                "last_name": "name.last_name",
                "phone_number": "phone_number",
                "email": "email",
                "date_of_birth": "date_of_birth",
                "airline_name": "airline",
            },
        )

        if body == False:
            return {"msg": "missing field"}, 422

        password = bcrypt.hashpw(body["password"].encode("utf-8"), bcrypt.gensalt())
        body["password"] = password

        mydb = getdb()
        cursor = mydb.cursor()

        cursor.execute(
            """
            SELECT username FROM airline_staff WHERE username=%(username)s
        """,
            {"username": body["username"]},
        )

        if sum(1 for (_) in cursor) > 0:
            return {"msg": "user already exists"}, 409

        try:
            cursor.execute(
                """
                INSERT INTO airline_staff VALUES (
                    %(username)s,
                    %(password)s,
                    %(first_name)s,
                    %(last_name)s,
                    %(date_of_birth)s,
                    %(airline_name)s
                )
            """,
                body,
            )

            cursor.execute(
                """
                    INSERT INTO airline_staff_phone_number
                        VALUES (
                            %(username)s,
                            %(phone_number)s
                        )
                """,
                body,
            )

            cursor.execute(
                """
                    INSERT INTO airline_staff_email_address
                        VALUES (
                            %(username)s,
                            %(email)s
                        )
                """,
                body,
            )
        except:
            return {"msg": "invalid field"}, 409

        cursor.close()
        mydb.commit()
        mydb.close()

        return {"msg": "success"}

    return {"msg": "unknown user type"}, 422


@user_api.route("/user/phone_number", methods=["POST"])
@jwt_required(locations="cookies")
def add_phone_numbers():
    body = request.json

    if "type" not in body:
        return {"msg": "missing field"}, 422

    if get_jwt_identity()["type"] != body["type"]:
        return {"msg": "Wrong Type!"}, 403

    if body["type"] == "customer":
        body = utility.convertBody(
            body,
            {
                "type": "type",
                "email": "username",
                "phone_numbers": "phone_numbers",
            },
        )

        if body == False:
            return {"msg": "missing field"}, 422

        if body["email"] != get_jwt_identity()["username"]:
            return {"msg": "Cannot add phone numbers for other customers!"}, 403

        mydb = getdb()
        cursor = mydb.cursor()

        try:
            for phone_number in body["phone_numbers"]:
                cursor.execute(
                    """
                        INSERT INTO customer_phone_number
                            VALUES (
                                %(email)s,
                                %(phone_number)s
                            )
                    """,
                    {"email": body["email"], "phone_number": phone_number},
                )
        except:
            return {"msg": "invalid field"}, 409

        cursor.close()
        mydb.commit()
        mydb.close()

        return {"msg": "success"}, 202

    elif body["type"] == "staff":
        body = utility.convertBody(
            body,
            {
                "type": "type",
                "username": "username",
                "phone_numbers": "phone_numbers",
            },
        )

        if body == False:
            return {"msg": "missing field"}, 422

        if body["username"] != get_jwt_identity()["username"]:
            return {"msg": "Cannot add phone numbers for other staff!"}, 403

        mydb = getdb()
        cursor = mydb.cursor()

        try:
            for phone_number in body["phone_numbers"]:
                cursor.execute(
                    """
                        INSERT INTO airline_staff_phone_number
                            VALUES (
                                %(username)s,
                                %(phone_number)s
                            )
                    """,
                    {"username": body["username"], "phone_number": phone_number},
                )
        except:
            return {"msg": "invalid field"}, 409

        cursor.close()
        mydb.commit()
        mydb.close()

        return {"msg": "success"}, 202

    return {"msg": "unknown user type"}, 422


@user_api.route("/user/email", methods=["POST"])
@jwt_required(locations="cookies")
def add_emails():
    body = request.json

    if get_jwt_identity()["type"] != "staff":
        return {"msg": "Staff Only!"}, 403

    body = utility.convertBody(
        body,
        {
            "username": "username",
            "emails": "emails",
        },
    )

    if body == False:
        return {"msg": "missing field"}, 422

    if body["username"] != get_jwt_identity()["username"]:
        return {"msg": "Cannot add emails for other staff!"}, 403

    mydb = getdb()
    cursor = mydb.cursor()

    try:
        for email in body["emails"]:
            cursor.execute(
                """
                    INSERT INTO airline_staff_email_address
                        VALUES (
                            %(username)s,
                            %(email)s
                        )
                """,
                {"username": body["username"], "email": email},
            )
    except:
        return {"msg": "invalid field"}, 409

    cursor.close()
    mydb.commit()
    mydb.close()

    return {"msg": "success"}, 202
