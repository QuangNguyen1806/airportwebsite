from database import mydb_raw
import sys
import re
import mysql.connector
from mysql.connector import Error, IntegrityError

def execute_sql_file(cursor, filepath):
    with open(filepath, 'r', encoding='utf-8') as f:
        sql_script = f.read()

    # Split the script into individual statements
    statements = sql_script.split(';')
    for statement in statements:
        statement = statement.strip()
        if statement:
            try:
                cursor.execute(statement)
            except IntegrityError as ie:
                print(f"[ERROR] IntegrityError in {filepath}: {ie}")
                sys.exit(1)
            except Error as e:
                print(f"[ERROR] MySQL error in {filepath}: {e}")
                sys.exit(1)

def main():
    cursor = mydb_raw.cursor()

    # 1. Create & select the database
    cursor.execute("CREATE DATABASE IF NOT EXISTS air_ticket_reservation")
    cursor.execute("USE air_ticket_reservation")

    # 2. Reset schema
    execute_sql_file(cursor, './database_init/clear.sql')
    execute_sql_file(cursor, './database_init/DDL.sql')
    mydb_raw.commit()

    # 3. Seed data in proper order
    for path in [
        './database_init/inserts/airline.sql',
        './database_init/inserts/airplane.sql',
        './database_init/inserts/airport.sql',
        './database_init/inserts/flight.sql',
        './database_init/inserts/customer.sql',
        './database_init/inserts/ticket.sql',
        './database_init/inserts/rate.sql',
        './database_init/inserts/dev.sql',
    ]:
        execute_sql_file(cursor, path)
    mydb_raw.commit()

    cursor.close()
    mydb_raw.close()

if __name__ == '__main__':
    main()
