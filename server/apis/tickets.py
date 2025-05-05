from flask import Blueprint, request, jsonify

from flask_jwt_extended import (
    get_jwt_identity,
    jwt_required,
)

import utility, json
from database import getdb
from datetime import datetime
from dateutil import parser
from constant import *

tickets_api = Blueprint("tickets_api", __name__)


def get_flight_registered_count(cursor, airline, flight_number, departure_date_time):
    result = {}

    cursor.execute(
        """
            SELECT COUNT(*)
                FROM ticket
                WHERE airline_name = %(airline)s
                    AND flight_number = %(flight_number)s
                    AND departure_date_time = %(departure_date_time)s
        """,
        {"airline": airline, "flight_number": flight_number, "departure_date_time": departure_date_time},
    )

    result["count"] = cursor.fetchall()[0]

    cursor.execute(
        """
            SELECT seat_number
                FROM flight JOIN airplane
                WHERE flight.airline_name = %(airline)s
                    AND flight_number = %(flight_number)s
                    AND departure_date_time = %(departure_date_time)s
                    AND ID = airplane_ID
        """,
        {"airline": airline, "flight_number": flight_number, "departure_date_time": departure_date_time},
    )

    result["max"] = cursor.fetchall()[0]

    return result


def get_current_price(cursor, airline, flight_number, departure_date_time):
    cursor.execute(
        """
        SELECT base_price
            FROM flight
            WHERE airline_name = %(airline)s
                    AND flight_number = %(flight_number)s
                    AND departure_date_time = %(departure_date_time)s
    """,
        {"airline": airline, "flight_number": flight_number, "departure_date_time": departure_date_time},
    )

    price = cursor.fetchall()[0][0]

    ticket_counts = get_flight_registered_count(cursor, airline, flight_number, departure_date_time)

    if float(ticket_counts["count"][0]) >= 0.8 * float(ticket_counts["max"][0]):
        price = round(price * 1.25, 2)

    return price


@tickets_api.route("/", methods=["GET"])
@jwt_required(locations="cookies")
def get_tickets():
    try:
        params = utility.convertParams(
            request.args,
            {
                "airline": "airline",
                "start_month": "start_date",
                "end_month": "end_date",
            },
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
            return {"msg": "airline unmatch"}, 403

        cursor.execute(
            """
                SELECT EXTRACT(YEAR_MONTH FROM ticket.purchased_date_time) AS yearmonth,
                    count(*) AS count
                FROM ticket
                WHERE airline_name = %(airline)s
                GROUP BY yearmonth
                HAVING
                    yearmonth >= %(start_month)s
                    AND yearmonth <= %(end_month)s
            """,
            params,
        )

        result = cursor.fetchall()
        cursor.close()

    response = {"tickets": []}

    current_date = params["start_month"]
    end_date = utility.nextMonth(params["end_month"])
    while current_date != end_date:
        response["tickets"].append(
            {
                "year_month": current_date,
                "number": 0,
            }
        )
        current_date = utility.nextMonth(current_date)

    for item in result:
        for month in response["tickets"]:
            if month["year_month"] == str(item[0]):
                month["number"] = item[1]
                break

    return response


@tickets_api.route("/price", methods=["GET"])
def get_ticket_price():
    try:
        params = utility.convertParams(
            request.args,
            {
                "airline_name": "airline_name",
                "flight_number": "flight_number",
                "departure_date_time": "departure_date_time",
            },
            auto_date=True,
        )
    except:
        return {"msg": "invalid field"}, 422

    if params == False:
        return {"msg": "missing field"}, 422

    if parser.parse(params["departure_date_time"]) < datetime.now():
        return {"msg": "past flight"}, 409

    with getdb() as mydb:
        cursor = mydb.cursor()
        cursor.execute(
            """
                SELECT airline_name, flight_number, departure_date_time
                FROM flight 
                WHERE airline_name = %(airline_name)s
                    AND flight_number = %(flight_number)s 
                    AND departure_date_time = %(departure_date_time)s
            """,
            params,
        )
        result = cursor.fetchall()

        if len(result) == 0:
            return {"msg": "flight not found"}, 404

        response = {
            "calculated_price": get_current_price(
                cursor, params["airline_name"], params["flight_number"], params["departure_date_time"]
            )
        }
        cursor.close()

    return response


@tickets_api.route("/register", methods=["PUT"])
@jwt_required(locations="cookies")
def create_new_ticket():
    try:
        body = utility.convertBody(
            json.loads(request.data.decode("UTF-8")),
            {
                "type": "type",
                "email": "email",
                "card_type": "card_type",
                "card_number": "card_number",
                "card_name": "card_name",
                "first_name": "first_name",
                "last_name": "last_name",
                "date_of_birth": "date_of_birth",
                "expiration_date": "expiration_date",
                "airline_name_to": "to.airline_name",
                "flight_number_to": "to.flight_number",
                "departure_date_time_to": "to.departure_date_time",
                "airline_name_back?": "back.airline_name",
                "flight_number_back?": "back.flight_number",
                "departure_date_time_back?": "back.departure_date_time",
            },
            auto_date=True,
        )
    except:
        return {"msg": "invalid field"}, 422

    if body == False:
        return {"msg": "missing field"}, 422

    if parser.parse(body["departure_date_time_to"]) < datetime.now():
        return {"msg": "past flight"}, 409

    if body["type"] == "round-trip":
        if (
            "airline_name_back" not in body
            or "flight_number_back" not in body
            or "departure_date_time_back" not in body
        ):
            return {"msg": "missing field"}, 422
        if parser.parse(body["departure_date_time_back"]) < datetime.now():
            return {"msg": "past flight"}, 409

    identity = get_jwt_identity()
    if identity["type"] != "customer":
        return {"msg": "customer only"}, 403

    if identity["username"] != body["email"]:
        return {"msg": "email not match"}, 403

    with getdb() as mydb:
        cursor = mydb.cursor()

        ticket_counts = get_flight_registered_count(
            cursor, body["airline_name_to"], body["flight_number_to"], body["departure_date_time_to"]
        )

        if ticket_counts["count"][0] >= ticket_counts["max"][0]:
            return {"msg": "flight is full"}, 409

        if body["type"] == "round-trip":
            ticket_counts = get_flight_registered_count(
                cursor, body["airline_name_back"], body["flight_number_back"], body["departure_date_time_back"]
            )

            if ticket_counts["count"][0] >= ticket_counts["max"][0]:
                return {"msg": "flight is full"}, 409

        body["calculated_price"] = get_current_price(
            cursor, body["airline_name_to"], body["flight_number_to"], body["departure_date_time_to"]
        )
        body["purchased_date_time"] = datetime.now().strftime("%Y-%m-%d %H:%M:%S")

        try:
            cursor.execute(
                """
                    INSERT INTO ticket(airline_name, flight_number, departure_date_time,
                                        first_name, last_name, date_of_birth, calculated_price,
                                        email, purchased_date_time, card_type, card_number,
                                        card_name, expiration_date)
                        VALUES (%(airline_name_to)s, %(flight_number_to)s, %(departure_date_time_to)s,
                                %(first_name)s, %(last_name)s, %(date_of_birth)s, %(calculated_price)s,
                                %(email)s, %(purchased_date_time)s, %(card_type)s, %(card_number)s,
                                %(card_name)s, %(expiration_date)s)
                """,
                body,
            )
        except:
            cursor.close()
            return {"msg": "invalid field"}, 409

        if body["type"] == "round-trip":
            body["calculated_price"] = get_current_price(
                cursor, body["airline_name_back"], body["flight_number_back"], body["departure_date_time_back"]
            )

            try:
                cursor.execute(
                    """
                        INSERT INTO ticket(airline_name, flight_number, departure_date_time,
                                            first_name, last_name, date_of_birth, calculated_price,
                                            email, purchased_date_time, card_type, card_number,
                                            card_name, expiration_date)
                            VALUES (%(airline_name_back)s, %(flight_number_back)s, %(departure_date_time_back)s,
                                    %(first_name)s, %(last_name)s, %(date_of_birth)s, %(calculated_price)s,
                                    %(email)s, %(purchased_date_time)s, %(card_type)s, %(card_number)s,
                                    %(card_name)s, %(expiration_date)s)
                    """,
                    body,
                )
            except:
                cursor.close()
                return {"msg": "invalid field"}, 409

        mydb.commit()

    return {"msg": "success"}, 201


@tickets_api.route("/unregister", methods=["POST"])
@jwt_required(locations="cookies")
def delete_ticket():
    if get_jwt_identity()["type"] != "customer":
        return {"msg": "customer only"}, 403

    body = utility.convertBody(
        json.loads(request.data.decode("UTF-8")),
        {
            "ticket_id": "ticket_id",
        },
    )

    if body == False:
        return {"msg": "missing field"}, 422

    with getdb() as mydb:
        cursor = mydb.cursor()

        cursor.execute(
            """
                SELECT email, departure_date_time
                    FROM ticket
                    WHERE ID = %(ticket_id)s
                    LIMIT 1
            """,
            body,
        )

        result = cursor.fetchall()

        if len(result) == 0:
            return {"msg": "ticket not exist"}, 404

        if result[0][0] != get_jwt_identity()["username"]:
            return {"msg": "can only unregister tickets belong to the user"}, 403

        if result[0][1] < datetime.now():
            return {"msg": "past flight"}, 409

        cursor.execute(
            """
                DELETE
                    FROM ticket
                    WHERE ID = %(ticket_id)s
            """,
            body,
        )

        mydb.commit()

    return {"msg": "success"}, 202
