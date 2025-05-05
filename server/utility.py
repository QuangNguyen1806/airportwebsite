from dateutil import parser, relativedelta


def convertDatetime(time):
    return parser.parse(time).strftime("%Y-%m-%d %H:%M:%S")


def convertDate(date):
    return parser.parse(date).strftime("%Y-%m-%d")


def convertMonth(date):
    return parser.parse(date).strftime("%Y%m")


def nextMonth(date):
    if "-" not in date:
        date = date[:4] + "-" + date[4:]
    return (parser.parse(date) + relativedelta.relativedelta(months=1)).strftime("%Y%m")


def convertBody(body, format, **kwargs):
    result = {}

    for item in format.keys():
        path = format[item].split(".")

        optional = False
        if item[-1] == "?":
            optional = True
            item = item[:-1]

        value = body
        for subpath in path:
            if subpath in value.keys():
                value = value[subpath]
            elif optional:
                value = None
                break
            else:
                return False

        if kwargs.get("auto_date", None) == True and value is not None:
            if "date_time" in item:
                value = convertDatetime(value)
            elif "date" in item:
                value = convertDate(value)
            elif "month" in item:
                value = convertMonth(value)

        result[item] = value

    return result


def convertParams(params, format, **kwargs):
    result = {}

    for item in format.keys():
        path = format[item]

        optional = False
        if item[-1] == "?":
            optional = True
            item = item[:-1]

        if params.get(path) == None:
            if optional:
                continue
            else:
                return False
        else:
            if kwargs.get("auto_date", None) == True:
                if "date_time" in item:
                    result[item] = convertDatetime(params.get(path))
                elif "date" in item:
                    result[item] = convertDate(params.get(path))
                elif "month" in item:
                    result[item] = convertMonth(params.get(path))
                else:
                    result[item] = params.get(path)
            else:
                result[item] = params.get(path)

    return result


def createSqlQuery(scheme: list, fields: dict):
    sql = ""

    for item in scheme:
        if item["name"] not in fields:
            continue

        selector = item["selector"].replace("%s", f"%({item['name']})s")
        sql += " AND " + selector

    return sql


def createSqlUpdate(scheme: list, fields: dict):
    sql = ""

    for item in scheme:
        if item["name"] not in fields:
            continue

        selector = item["selector"].replace("%s", f"%({item['name']})s")
        sql += selector + ", "

    if len(sql) == 0:
        return sql

    return sql[:-2]


def getStaff(cursor, username, *args):
    select = ""
    if len(args) == 0:
        select = "*"
    else:
        for item in args:
            select += item + ", "
        select = select[:-2]

    cursor.execute(
        """
        SELECT {select}
            FROM airline_staff
            WHERE username = %(username)s
            LIMIT 1
    """.format(
            select=select
        ),
        {"username": username},
    )

    return cursor.fetchall()[0]


def getFlight(cursor, airline, flight_number, departure_date_time):
    cursor.execute(
        """
            SELECT flight.airline_name,flight_number,departure_date_time,departure_airport_code,
                    arrival_date_time,arrival_airport_code,base_price,status,id, seat_number,
                    manufacturing_company,manufacturing_date, age
                    FROM flight JOIN airplane
                    WHERE flight.airline_name=%(airline_name)s
                        AND flight_number=%(flight_number)s
                        AND departure_date_time=%(departure_date_time)s
                        AND airplane.ID = airplane_ID
                    LIMIT 1
        """,
        {"airline_name": airline, "flight_number": flight_number, "departure_date_time": departure_date_time},
    )

    result = cursor.fetchall()

    if len(result) == 0:
        return None

    items = result[0]

    return {
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


def getCustomer(cursor, email):
    cursor.execute(
        """
            SELECT email, first_name, last_name, building_number,
                    street_name, apartment_number, city, state,
                    zip_code, passport_number, passport_expiration,
                    passport_country, date_of_birth
                FROM customer
                WHERE email=%(email)s
            LIMIT 1
        """,
        {"email": email},
    )

    result = cursor.fetchall()

    if len(result) == 0:
        return None

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
        {"email": email},
    )

    result = cursor.fetchall()

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
