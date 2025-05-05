import os
from dotenv import load_dotenv

import mysql.connector

load_dotenv()

server_type = os.getenv("sql_server")

mydb_raw = mysql.connector.connect(
    host=os.getenv(f"mysql_host_{server_type}"),
    user=os.getenv(f"mysql_user_{server_type}"),
    password=os.getenv(f"mysql_password_{server_type}"),
)

try:
    mydb = mysql.connector.connect(
        host=os.getenv(f"mysql_host_{server_type}"),
        user=os.getenv(f"mysql_user_{server_type}"),
        password=os.getenv(f"mysql_password_{server_type}"),
        database="air_ticket_reservation",
    )
except:
    pass


def getdb():
    return mysql.connector.connect(
        host=os.getenv(f"mysql_host_{server_type}"),
        user=os.getenv(f"mysql_user_{server_type}"),
        password=os.getenv(f"mysql_password_{server_type}"),
        database="air_ticket_reservation",
    )
