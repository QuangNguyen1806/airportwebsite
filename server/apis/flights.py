from flask import Blueprint, request

import utility
import json

from flask_jwt_extended import get_jwt_identity, jwt_required

from database import getdb
from constant import valid_status
from datetime import datetime

flights_api = Blueprint("flights_api", __name__)


@flights_api.route("/", methods=["GET"])
@jwt_required(locations="cookies")
def get_flights():
    try:
        params = utility.convertParams(
            request.args,
            {
                "airline": "airline",
                "start_date?": "start_date",
                "end_date?": "end_date",
                "source_city?": "source_city",
                "source_airport?": "source_airport",
                "destination_city?": "destination_city",
                "destination_airport?": "destination_airport",
            },
            auto_date=True,
        )
    except:
        return {"msg": "invalid field"}, 422

    if params == False:
        return {"msg": "missing field"}, 422

    mydb = getdb()
    cursor = mydb.cursor()

    if get_jwt_identity()["type"] != "staff":
        return {"msg": "staff only"}, 403

    if utility.getStaff(cursor, get_jwt_identity()["username"], "airline_name")[0] != params["airline"]:
        return {"msg": "airline staff is not authorized to get other airline's information "}, 403

    selector = utility.createSqlQuery(
        [
            {"name": "airline", "selector": "flight.airline_name = %s"},
            {"name": "start_date", "selector": "DATE(departure_date_time) >= %s"},
            {"name": "end_date", "selector": "DATE(departure_date_time) <= %s"},
            {"name": "source_city", "selector": "departure.city = %s"},
            {"name": "destination_city", "selector": "arrival.city = %s"},
            {"name": "source_airport", "selector": "departure_airport_code = %s"},
            {"name": "destination_airport", "selector": "arrival_airport_code = %s"},
        ],
        params,
    )

    cursor.execute(
        """
            SELECT flight.airline_name, flight_number, departure_date_time, departure_airport_code,
                    arrival_date_time, arrival_airport_code, base_price, status,
                    id, seat_number, manufacturing_company, manufacturing_date, age
                FROM flight
                    NATURAL JOIN airplane
                    JOIN airport AS arrival
                    JOIN airport AS departure
                WHERE airplane.ID = airplane_ID
                    AND arrival.code = arrival_airport_code
                    AND departure.code = departure_airport_code
                    {selector}
        """.format(
            selector=selector
        ),
        params,
    )

    result = cursor.fetchall()
    cursor.close()
    mydb.close()

    response = {"flights": []}

    for item in result:
        response["flights"].append(
            {
                "airline_name": item[0],
                "flight_number": item[1],
                "departure_date_time": item[2],
                "departure_airport_code": item[3],
                "arrival_date_time": item[4],
                "arrival_airport_code": item[5],
                "base_price": item[6],
                "status": item[7],
                "airplane": {
                    "id": item[8],
                    "seat_number": item[9],
                    "manufacturing_company": item[10],
                    "manufacturing_date": item[11],
                    "age": item[12],
                },
            }
        )

    return response


@flights_api.route("/", methods=["PUT"])
@jwt_required(locations="cookies")
def create_flights():
    try:
        body = utility.convertBody(
            json.loads(request.data.decode("UTF-8")),
            {
                "airline_name": "airline_name",
                "flight_number": "flight_number",
                "departure_date_time": "departure_date_time",
                "departure_airport_code": "departure_airport_code",
                "arrival_date_time": "arrival_date_time",
                "arrival_airport_code": "arrival_airport_code",
                "base_price": "base_price",
                "airplane_ID": "airplane_id",
            },
            auto_date=True,
        )
    except:
        return {"msg": "invalid field"}, 422

    if body == False:
        return {"msg": "missing field"}, 422

    mydb = getdb()
    cursor = mydb.cursor()

    if get_jwt_identity()["type"] != "staff":
        return {"msg": "staff only"}, 403

    if utility.getStaff(cursor, get_jwt_identity()["username"], "airline_name")[0] != body["airline_name"]:
        return {"msg": "airline staff is not authorized to get other airline's information "}, 403
    try:
        cursor.execute(
            """
                INSERT INTO flight
                    VALUES (%(airline_name)s, %(flight_number)s, %(departure_date_time)s,
                            %(departure_airport_code)s, %(arrival_date_time)s, %(arrival_airport_code)s,
                            %(base_price)s, %(airplane_ID)s, "scheduled");
            """,
            body,
        )
    except:
        cursor.close()
        mydb.close()
        return {"msg": "invalid field"}, 409

    mydb.commit()
    cursor.close()
    mydb.close()

    return {"msg": "success"}, 201


@flights_api.route("/status", methods=["GET"])
def get_flights_status():
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

    mydb = getdb()
    cursor = mydb.cursor()
    cursor.execute(
        """
            SELECT flight.airline_name,flight_number,departure_date_time,departure_airport_code,
                arrival_date_time,arrival_airport_code,base_price,status,id, seat_number,
		        manufacturing_company,manufacturing_date, age
                FROM flight
                    JOIN airplane
                WHERE flight.airline_name = %(airline_name)s
                    AND flight_number = %(flight_number)s
                    AND departure_date_time = %(departure_date_time)s
                    AND airplane.ID = airplane_ID
        """,
        params,
    )

    result = cursor.fetchall()
    cursor.close()
    mydb.close()

    if len(result) == 0:
        return {"msg": "flight not exist"}, 404

    items = result[0]

    response = {
        "airline_name": items[0],
        "flight_number": items[1],
        "departure_date_time": items[2],
        "departure_airport_code": items[3],
        "arrival_date_time": items[4],
        "arrival_airport_code": items[5],
        "base_price": items[6],
        "status": items[7],
        "airplane": {
            "id": items[8],
            "seat_number": items[9],
            "manufacturing_company": items[10],
            "manufacturing_date": items[11],
            "age": items[12],
        },
    }

    return response


@flights_api.route("/status", methods=["POST"])
@jwt_required(locations="cookies")
def update_flights_status():
    try:
        body = utility.convertBody(
            json.loads(request.data.decode("UTF-8")),
            {
                "status": "status",
                "airline_name": "airline_name",
                "flight_number": "flight_number",
                "departure_date_time": "departure_date_time",
            },
            auto_date=True,
        )
    except:
        return {"msg": "invalid field"}, 422

    if body == False:
        return {"msg": "missing field"}, 422

    mydb = getdb()
    cursor = mydb.cursor()

    if get_jwt_identity()["type"] != "staff":
        return {"msg": "staff only"}, 403

    if utility.getStaff(cursor, get_jwt_identity()["username"], "airline_name")[0] != body["airline_name"]:
        return {"msg": "airline staff is not authorized to get other airline's information "}, 403

    cursor.execute(
        """
            SELECT *
                FROM flight
                WHERE airline_name = %(airline_name)s
                    AND flight_number = %(flight_number)s
                    AND departure_date_time = %(departure_date_time)s
        """,
        body,
    )

    result = cursor.fetchall()
    if len(result) == 0:
        return {"msg": "flight not found"}, 404

    if body["status"] not in valid_status:
        return {"msg": "status not exist"}, 409

    cursor.execute(
        """
            UPDATE flight
                SET status = %(status)s
                WHERE airline_name = %(airline_name)s
                    AND flight_number = %(flight_number)s
                    AND departure_date_time = %(departure_date_time)s
        """,
        body,
    )

    mydb.commit()
    cursor.close()
    mydb.close()

    return {"msg": "success"}, 202


@flights_api.route("/future", methods=["GET"])
def get_future_flights():
    params = utility.convertParams(
        request.args,
        {
            "source_city?": "source_city",
            "source_airport?": "source_airport",
            "destination_city?": "destination_city",
            "destination_airport?": "destination_airport",
            "departure_date": "departure_date",
            "return_date?": "return_date",
        },
    )

    if params == False:
        return {"msg": "missing field"}, 422

    if "source_city" not in params and "source_airport" not in params:
        return {"msg": "missing field"}, 422

    if "destination_city" not in params and "destination_airport" not in params:
        return {"msg": "missing field"}, 422

    selector_to = utility.createSqlQuery(
        [
            {"name": "source_city", "selector": "departure.city = %s"},
            {"name": "source_airport", "selector": "departure_airport_code = %s"},
            {"name": "destination_city", "selector": "arrival.city = %s"},
            {"name": "destination_airport", "selector": "arrival_airport_code = %s"},
            {"name": "departure_date", "selector": "DATE(departure_date_time) = %s"},
        ],
        params,
    )

    mydb = getdb()
    cursor = mydb.cursor()

    params["now"] = datetime.now().strftime("%Y-%m-%d %H:%M:%S")

    cursor.execute(
        """
        SELECT flight.airline_name, flight_number, departure_date_time, departure_airport_code,
                    arrival_date_time, arrival_airport_code, base_price, status,
                    id, seat_number, manufacturing_company, manufacturing_date, age
                FROM flight
                    NATURAL JOIN airplane
                    JOIN airport AS arrival
                    JOIN airport AS departure
                WHERE airplane.ID = airplane_ID
                    AND arrival.code = arrival_airport_code
                    AND departure.code = departure_airport_code
                    AND departure_date_time >= %(now)s
                    {selector_to}
        """.format(
            selector_to=selector_to
        ),
        params,
    )

    response = {"flights_to": []}

    result = cursor.fetchall()

    for item in result:
        response["flights_to"].append(
            {
                "airline_name": item[0],
                "flight_number": item[1],
                "departure_date_time": item[2],
                "departure_airport_code": item[3],
                "arrival_date_time": item[4],
                "arrival_airport_code": item[5],
                "base_price": item[6],
                "status": item[7],
                "airplane": {
                    "id": item[8],
                    "seat_number": item[9],
                    "manufacturing_company": item[10],
                    "manufacturing_date": item[11],
                    "age": item[12],
                },
            }
        )

    if "return_date" in params and params["return_date"] != None:
        selector_back = utility.createSqlQuery(
            [
                {"name": "destination_city", "selector": "departure.city = %s"},
                {"name": "destination_airport", "selector": "departure_airport_code = %s"},
                {"name": "source_city", "selector": "arrival.city = %s"},
                {"name": "source_airport", "selector": "arrival_airport_code = %s"},
                {"name": "return_date", "selector": "DATE(departure_date_time) = %s"},
            ],
            params,
        )

        cursor.execute(
            """
            SELECT flight.airline_name, flight_number, departure_date_time, departure_airport_code,
                        arrival_date_time, arrival_airport_code, base_price, status,
                        id, seat_number, manufacturing_company, manufacturing_date, age
                    FROM flight
                        NATURAL JOIN airplane
                        JOIN airport AS arrival
                        JOIN airport AS departure
                    WHERE airplane.ID = airplane_ID
                        AND arrival.code = arrival_airport_code
                        AND departure.code = departure_airport_code
                        AND departure_date_time >= %(now)s
                        {selector_back}
            """.format(
                selector_back=selector_back
            ),
            params,
        )

        response["flights_from"] = []

        result = cursor.fetchall()

        for item in result:
            response["flights_from"].append(
                {
                    "airline_name": item[0],
                    "flight_number": item[1],
                    "departure_date_time": item[2],
                    "departure_airport_code": item[3],
                    "arrival_date_time": item[4],
                    "arrival_airport_code": item[5],
                    "base_price": item[6],
                    "status": item[7],
                    "airplane": {
                        "id": item[8],
                        "seat_number": item[9],
                        "manufacturing_company": item[10],
                        "manufacturing_date": item[11],
                        "age": item[12],
                    },
                }
            )

    cursor.close()
    mydb.close()

    return response


@flights_api.route("/schedule", methods=["GET"])
@jwt_required(locations="cookies")
def get_scheduled_flights():
    try:
        params = utility.convertParams(
            request.args,
            {
                "email": "email",
                "type": "type",
                "start_date?": "start_date",
                "end_date?": "end_date",
                "destination_city?": "destination_city",
                "destination_airport?": "destination_airport",
                "source_city?": "source_city",
                "source_airport?": "source_airport",
                "airline?": "airline",
            },
            auto_date=True,
        )
    except:
        return {"msg": "invalid field"}, 422

    if params == False:
        return {"msg": "missing field"}, 422

    if get_jwt_identity()["type"] != params["type"]:
        return {"msg": "user type not match"}, 403

    selector = utility.createSqlQuery(
        [
            {"name": "start_date", "selector": "DATE(departure_date_time) >= %s"},
            {"name": "end_date", "selector": "DATE(departure_date_time) <= %s"},
            {"name": "source_city", "selector": "departure.city = %s"},
            {"name": "destination_city", "selector": "arrival.city = %s"},
            {"name": "source_airport", "selector": "departure_airport_code = %s"},
            {"name": "destination_airport", "selector": "arrival_airport_code = %s"},
        ],
        params,
    )

    if params["type"] == "customer":
        mydb = getdb()
        cursor = mydb.cursor()

        if get_jwt_identity()["username"] != params["email"]:
            return {"msg": "can only flights belong to the user"}, 403

        cursor.execute(
            """
                WITH tp AS
                    (SELECT * 
                        FROM ticket
                            NATURAL JOIN flight
                            NATURAL LEFT OUTER JOIN rate 
                        WHERE email = %(email)s
                    )
                SELECT tp.ID, tp.airline_name, tp.flight_number, tp.departure_date_time, tp.departure_airport_code,
                    tp.arrival_date_time, tp.arrival_airport_code, tp.base_price, tp.calculated_price,tp.status,
                    tp.airplane_id, airplane.seat_number, airplane.manufacturing_company, airplane.manufacturing_date,
                    airplane.age, tp.rating, tp.comment, tp.first_name, tp.last_name, tp.date_of_birth
                FROM tp
                    JOIN airplane
                    JOIN airport AS arrival
                    JOIN airport AS departure
                WHERE airplane.id = tp.airplane_id
                    AND airplane.airline_name = tp.airline_name
                    AND arrival.code = tp.arrival_airport_code
                    AND departure.code = tp.departure_airport_code
                    {selector}
            """.format(
                selector=selector
            ),
            params,
        )

        result = cursor.fetchall()
        cursor.close()
        mydb.close()

        response = {"flights": []}

        for items in result:
            flight = {
                "ticket_id": items[0],
                "airline_name": items[1],
                "flight_number": items[2],
                "departure_date_time": items[3],
                "departure_airport_code": items[4],
                "arrival_date_time": items[5],
                "arrival_airport_code": items[6],
                "base_price": items[7],
                "calculated_price": items[8],
                "status": items[9],
                "airplane": {
                    "id": items[10],
                    "seat_number": items[11],
                    "manufacturing_company": items[12],
                    "manufacturing_date": items[13],
                    "age": items[14],
                },
                "customer": {"first_name": items[17], "last_name": items[18], "date_of_birth": items[19]},
            }
            if items[15] != None:
                flight["comment"] = {
                    "rating": items[15],
                    "comment": items[16],
                }

            response["flights"].append(flight)

        return response

    elif params["type"] == "staff":
        if "airline" not in params:
            return {"msg": "missing field"}, 422

        mydb = getdb()
        cursor = mydb.cursor()

        if utility.getStaff(cursor, get_jwt_identity()["username"], "airline_name")[0] != params["airline"]:
            return {"msg": "airline staff is not authorized to get other airline's information "}, 403

        customer = utility.getCustomer(cursor, params["email"])

        if customer == None:
            return {"msg": "unknown email address"}, 404

        cursor.execute(
            """
                WITH tp AS
                    (SELECT * 
                        FROM ticket
                            NATURAL JOIN flight
                            NATURAL LEFT OUTER JOIN rate 
                        WHERE email = %(email)s
                    ) 
                SELECT tp.ID, tp.airline_name, tp.flight_number, tp.departure_date_time, tp.departure_airport_code,
                    tp.arrival_date_time, tp.arrival_airport_code, tp.base_price, tp.calculated_price, tp.status,
                    tp.airplane_id, airplane.seat_number, airplane.manufacturing_company, airplane.manufacturing_date,
                    airplane.age, tp.rating, tp.comment, tp.first_name, tp.last_name, tp.date_of_birth
                FROM tp
                    JOIN airplane
                    JOIN airport AS arrival
                    JOIN airport AS departure
                WHERE airplane.id = tp.airplane_id
                    AND airplane.airline_name = tp.airline_name
                    AND arrival.code = tp.arrival_airport_code
                    AND departure.code = tp.departure_airport_code
                    AND tp.airline_name = %(airline)s
                    {selector}
            """.format(
                selector=selector
            ),
            params,
        )

        result = cursor.fetchall()
        cursor.close()
        mydb.close()

        response = {"flights": [], "customer": customer}

        for items in result:
            flight = {
                "ticket_id": items[0],
                "airline_name": items[1],
                "flight_number": items[2],
                "departure_date_time": items[3],
                "departure_airport_code": items[4],
                "arrival_date_time": items[5],
                "arrival_airport_code": items[6],
                "base_price": items[7],
                "calculated_price": items[8],
                "status": items[9],
                "airplane": {
                    "id": items[10],
                    "seat_number": items[11],
                    "manufacturing_company": items[12],
                    "manufacturing_date": items[13],
                    "age": items[14],
                },
                "customer": {"first_name": items[17], "last_name": items[18], "date_of_birth": items[19]},
            }
            if items[15] != None:
                flight["comment"] = {
                    "rating": items[15],
                    "comment": items[16],
                }

            response["flights"].append(flight)

        return response

    return {"msg": "unknown type"}, 422
