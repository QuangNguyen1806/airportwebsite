from flask import Blueprint, request, jsonify
from flask_jwt_extended import get_jwt_identity, jwt_required

from database import getdb

import utility

customers_api = Blueprint("customers_api", __name__)


@customers_api.route("/", methods=["GET"])
@jwt_required(locations="cookies")
def get_customer_info():
    params = utility.convertParams(request.args, {"type": "type", "username": "username"})

    if params == False:
        return {"msg": "missing field"}, 422

    identity = get_jwt_identity()
    if params["username"] != identity["username"]:
        return {"msg": "username not match"}, 403

    if params["type"] != identity["type"]:
        return {"msg": "wrong user type"}, 409

    if params["type"] == "customer":
        with getdb() as mydb:
            cursor = mydb.cursor()
            cursor.execute(
                """
                SELECT email, first_name, last_name, building_number,
                        street_name, apartment_number, city, state,
                        zip_code, passport_number, passport_expiration,
                        passport_country, date_of_birth
                    FROM customer
                    WHERE email = %(email)s
            """,
                {"email": params["username"]},
            )

            result = cursor.fetchall()

            (
                email,
                first_name,
                last_name,
                building_number,
                street_name,
                apartment_number,
                city,
                state,
                zip_code,
                passport_number,
                passport_expiration,
                passport_country,
                date_of_birth,
            ) = result[0]

            cursor.execute(
                """
                    SELECT phone_number
                        FROM customer_phone_number
                        WHERE email = %(email)s
                """,
                {"email": params["username"]},
            )

            result = cursor.fetchall()
            cursor.close()

            phone_numbers = []
            for item in result:
                phone_numbers.append(item[0])

            return {
                "email": email,
                "first_name": first_name,
                "last_name": last_name,
                "phone_numbers": phone_numbers,
                "address": {
                    "building_number": building_number,
                    "street_name": street_name,
                    "apartment_number": apartment_number,
                    "city": city,
                    "state": state,
                    "zip_code": zip_code,
                },
                "passport": {"number": passport_number, "expiration": passport_expiration, "country": passport_country},
                "date_of_birth": date_of_birth,
            }

    elif params["type"] == "staff":
        with getdb() as mydb:
            cursor = mydb.cursor()
            cursor.execute(
                """
                    SELECT username, first_name, last_name,
                            date_of_birth, airline_name
                        FROM airline_staff
                        WHERE username = %(username)s
                """,
                params,
            )

            result = cursor.fetchall()

            (username, first_name, last_name, date_of_birth, airline_name) = result[0]

            cursor.execute(
                """
                    SELECT phone_number
                        FROM airline_staff_phone_number
                        WHERE username = %(username)s
                """,
                params,
            )

            result = cursor.fetchall()

            phone_numbers = []
            for item in result:
                phone_numbers.append(item[0])

            cursor.execute(
                """
                    SELECT email_address
                        FROM airline_staff_email_address
                        WHERE username = %(username)s
                """,
                params,
            )

            result = cursor.fetchall()
            cursor.close()

            emails = []
            for item in result:
                emails.append(item[0])

            return {
                "username": username,
                "first_name": first_name,
                "last_name": last_name,
                "phone_numbers": phone_numbers,
                "emails": emails,
                "date_of_birth": date_of_birth,
                "airline_name": airline_name,
            }

    return {"msg": "unknown type"}, 422


@customers_api.route("/all", methods=["GET"])
@jwt_required(locations="cookies")
def get_customers():
    try:
        params = utility.convertParams(
            request.args,
            {"airline": "airline", "flight_number": "flight_number", "departure_date_time": "departure_date_time"},
            auto_date=True,
        )
    except:
        return {"msg": "invalid field"}, 422

    if params == False:
        return {"msg": "missing field"}, 422

    identity = get_jwt_identity()
    if identity["type"] != "staff":
        return {"msg": "staff only"}, 403

    with getdb() as mydb:
        cursor = mydb.cursor()

        if utility.getStaff(cursor, identity["username"], "airline_name")[0] != params["airline"]:
            return {"msg": "airline not match"}, 403

        flight = utility.getFlight(cursor, params["airline"], params["flight_number"], params["departure_date_time"])

        if flight == None:
            return {"msg": "flight not exist"}, 404

        cursor.execute(
            """
                SELECT customer.email, customer.first_name, customer.last_name, building_number,
                            street_name, apartment_number, city, state,
                            zip_code, passport_number, passport_expiration,
                            passport_country, customer.date_of_birth, purchased_date_time,
                            calculated_price
                    FROM ticket
                        JOIN customer
                    WHERE ticket.email = customer.email
                        AND airline_name = %(airline)s
                        AND flight_number = %(flight_number)s
                        AND departure_date_time = %(departure_date_time)s
            """,
            params,
        )

        response = {"customers": []}

        result = cursor.fetchall()
        for item in result:
            cursor.execute(
                """
                    SELECT phone_number
                        FROM customer_phone_number
                        WHERE email = %(email)s
                """,
                {"email": item[0]},
            )

            phone_numbers = []

            for phone_number in cursor.fetchall():
                phone_numbers.append(phone_number[0])

            response["customers"].append(
                {
                    "email": item[0],
                    "first_name": item[1],
                    "last_name": item[2],
                    "phone_numbers": phone_numbers,
                    "address": {
                        "building_number": item[3],
                        "street_name": item[4],
                        "apartment_number": item[5],
                        "city": item[6],
                        "state": item[7],
                        "zip_code": item[8],
                    },
                    "passport": {"number": item[9], "expiration": item[10], "country": item[11]},
                    "date_of_birth": item[12],
                    "purchased_date": item[13],
                    "price": item[14],
                }
            )

        response["flight"] = flight

        cursor.close()

    return response


@customers_api.route("/frequent", methods=["GET"])
@jwt_required(locations="cookies")
def get_frequent_customers():
    try:
        params = utility.convertParams(
            request.args,
            {"airline": "airline", "start_month": "start_date", "end_month": "end_date"},
            auto_date=True,
        )
    except:
        return {"msg": "invalid field"}, 422

    if params == False:
        return {"msg": "missing field"}, 422

    identity = get_jwt_identity()
    if identity["type"] != "staff":
        return {"msg": "staff only"}, 403

    with getdb() as mydb:
        cursor = mydb.cursor()

        if utility.getStaff(cursor, identity["username"], "airline_name")[0] != params["airline"]:
            return {"msg": "airline not match"}, 403

        cursor.execute(
            """
                SELECT email,
                        count(*) as number
                    FROM ticket
                    WHERE EXTRACT(YEAR_MONTH from ticket.purchased_date_time) >= %(start_month)s
                        AND EXTRACT(YEAR_MONTH from ticket.purchased_date_time) <= %(end_month)s
                        AND airline_name = %(airline)s
                    GROUP BY email
                    ORDER BY number DESC
                    LIMIT 1
            """,
            params,
        )

        result = cursor.fetchall()[0]

        response = {"customer": utility.getCustomer(cursor, result[0])}

        cursor.close()

        response["customer"]["count"] = result[1]

    return response
