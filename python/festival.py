from flask import Flask, jsonify,request
from flask_restful import Resource, Api
from flask_cors import CORS
import cx_Oracle
import datetime
import json

app = Flask(__name__)
api = Api(app)
CORS(app)

# Oracle DB 연결 정보
# db_user = 'open_source'
# db_password = '1111'
# db_host = 'localhost'
# db_port = '1521'
# db_service = 'My_Oracle1'
# ================
# ==============

# 데이터베이스 연결
def get_db_connection():
    # connection = cx_Oracle.connect(
    #     user=db_user,
    #     password=db_password,
    #     dsn=f"{db_host}:{db_port}/{db_service}"
    # )
    # conn = cx_Oracle.connect('open_source/1111@localhost:1521/xe')
    # conn = cx_Oracle.connect('garage/1111@3.143.252.195:1521/xe')
    conn = cx_Oracle.connect('bae/1111@192.168.0.21:1521/xe')
    return conn

# 쇼핑몰 데이터 응답 서버 루트 URL에 대한 핸들러
@app.route('/')
def index():
    return "쇼핑몰 데이터 응답 서버에 접속하셨습니다."

# 축제 데이터 조회 API
@app.route('/festival', methods=['GET'])
def get_festivals():
    try:
        # print("::::::::::::::::")
        connection = get_db_connection()
        cursor = connection.cursor()
        cursor.execute("SELECT f.*, i.image_name FROM festivals f JOIN festival_image i ON f.festivalid = i.festivalid WHERE f.STARTDATE <= SYSDATE AND f.ENDDATE >= SYSDATE - 14")
        # rows = cursor.fetchall()
        # cursor.close()
        # connection.close()
        # print("::::::::::::::=>>",rows)

        # 결과를 JSON 형식으로 변환하여 반환
        # print(rows[0])
        FASTIVALS = []
        row = cursor.fetchone()
        # print(":::::::::::::",row)

        while row:
            fastival = {
                'FESTIVALID': row[0],
                'FESTIVALNAME': row[1],
                'LOCATION': row[2],
                'STARTDATE': row[3].strftime('%Y-%m-%d') if row[3] else None,
                'ENDDATE': row[4].strftime('%Y-%m-%d') if row[4] else None,
                'DESCRIPTION': row[5],#.read() if row[5] else None,  # LOB 객체 읽기
                'WEBSITE': row[6],
                'ROADADDRESS': row[7],
                'JIBUNADDRESS': row[8],
                'LATITUDE': row[9],
                'LONGITUDE': row[10],
                'IMAGE_NAME': row[11]
            }
            FASTIVALS.append(fastival)
            row = cursor.fetchone()

        cursor.close()
        connection.close()
        print(FASTIVALS)

        return jsonify(FASTIVALS)
    except Exception as e:
        return jsonify({'error': str(e)})


# 시장 데이터 조회 API
@app.route('/market', methods=['GET'])
def get_markets():
    try:
        connection = get_db_connection()
        cursor = connection.cursor()
        cursor.execute("SELECT * FROM market")

        MARKETS = []
        row = cursor.fetchone()
        print(row)

        while row:
            market = {
                'MARKETNAME': row[1],
                'MARKETTYPE': row[2],
                'ROADADDRESS': row[3],
                'JIBUNADDRESS': row[4],
                'OPENINGPERIOD': row[5],
                'LATITUDE': row[6],
                'LONGITUDE': row[7],
                'PUBLICTOILET': row[8],
                'PARKINGAVAILABILITY': row[9],
            }
            MARKETS.append(market)
            row = cursor.fetchone()

        cursor.close()
        connection.close()
        # print(MARKETS)

        return jsonify(MARKETS)
    except Exception as e:
        return jsonify({'error': str(e)})


# 맛집 데이터 조회 API
@app.route('/eat_place', methods=['GET'])
def get_restaurants():
    try:
        connection = get_db_connection()
        cursor = connection.cursor()
        cursor.execute("SELECT * FROM restaurants")

        EAT_PLACE = []
        row = cursor.fetchone()

        while row:
            eat_place = {
                'RESTAURANTNAME': row[2],
                'RESTAURANTADDRESS': row[3],
                'REGION': row[1],
                'LATITUDE': row[4],
                'LONGITUDE': row[5]
            }
            EAT_PLACE.append(eat_place)
            row = cursor.fetchone()

        cursor.close()
        connection.close()

        return jsonify(EAT_PLACE)
    except Exception as e:
        return jsonify({'error': str(e)})
class FestivalData(Resource):
    def get(self):
        try:
            conn = get_db_connection()
            # 클라이언트 측에서 추출
            # festivalId = request.args.get('festival_id')
            # festival_id = request.args.get('id')
            festival_id = request.args.get('festival_id')
            selected_zone = request.args.get('loc')
            # print("festivalID:::::", festival_id)
            # print(selected_zone,":::::::::::--")

            # 오늘 날짜 구하기
            today = datetime.date.today()

            # conn
            cur = conn.cursor()

            # 쿼리문 수행
            # cursor.execute("SELECT * FROM festivals")
            # selected_zone = request.args.get('selectedZone')
            if selected_zone:
                cur.execute(
                    "SELECT f.*, i.image_name FROM festivals f JOIN festival_image i ON f.festivalid = i.festivalid WHERE (RoadAddress LIKE '%' || :zone || '%' OR JibunAddress LIKE '%' || :zone || '%') AND f.STARTDATE <= SYSDATE AND f.ENDDATE >= SYSDATE - 14",
                    {'zone': selected_zone})
            elif festival_id:
                cur.execute(
                    "SELECT  f.*, i.image_name FROM festivals f JOIN festival_image i ON f.festivalid = i.festivalid WHERE f.FestivalID=:festival",
                    {'festival': festival_id})

            # print("selected_zone::::::::::::::=>>",selected_zone)

            # 결과를 JSON 형식으로 변환하여 반환
            # print(rows[0])
            FESTIVALS = []
            row = cur.fetchone()
            # print(":::::::::::::",row)

            while row:
                festival = {
                    'FestivalID': row[0],
                    'FestivalName': row[1],
                    'Location': row[2],
                    'StartDate': row[3].strftime('%Y-%m-%d') if row[3] else None,
                    'EndDate': row[4].strftime('%Y-%m-%d') if row[4] else None,
                    'Description': row[5],#.read() if row[5] else None,  # LOB 객체 읽기
                    'Website': row[6],
                    'RoadAddress': row[7],
                    'JibunAddress': row[8],
                    'Latitude': row[9],
                    'Longitude': row[10],
                    'ImageName': row[11]

                }
                FESTIVALS.append(festival)
                row = cur.fetchone()

            cur.close()
            # conn.close()
            print(":::::festival python::::",FESTIVALS)

            return jsonify(FESTIVALS)


        except Exception as e:
            return jsonify({'error': str(e)})

class EventData(Resource):
    def get(self):
        ## 클라이언트로부터 이벤트ID를 받음
        EventID = request.args.get('EVENTID')
        selected_zone = request.args.get('loc')
        # selected_zone = request.args.get('loc')
        # print(festival_id)

        ## 쿼리 실행
        conn= get_db_connection()
        cur = conn.cursor()

        # 오늘 날짜 구하기
        today = datetime.date.today()

        ## 확인용 전체 데이터 받아오기
        # cur.execute("SELECT * FROM EVENTS")

        ## event_id 가져오기
        # cur.execute("SELECT * FROM Events WHERE EventID = :event_id",
        #             {"event_id": event_id})

        if EventID:
            ## EVENTID로 조회
            cur.execute("SELECT * FROM Events WHERE EventID = :EventID",
                        {"EventID": EventID})
        elif selected_zone:
            cur.execute(
                # "SELECT * FROM Events WHERE (RoadAddress LIKE '%' || :zone || '%' OR JibunAddress LIKE '%' || :zone || '%') AND StartDate >= :today",
                "SELECT * FROM (SELECT * FROM Events WHERE (RoadAddress LIKE '%' || :zone || '%' OR JibunAddress LIKE '%' || :zone || '%') AND StartDate >= :today ORDER BY DBMS_RANDOM.RANDOM) WHERE rownum <= 4",
                {'zone': selected_zone, 'today': today})
        else:
            ## 랜덤하게 가져옴
            cur.execute(
                "SELECT * FROM (SELECT * FROM Events ORDER BY DBMS_RANDOM.RANDOM) WHERE rownum <= 4  AND StartDate >= :today",
                {'today': today})

        ## 결과 가져오기
        rows = cur.fetchall()
        # EVENTS = []
        # row = cur.fetchone()
        print("row::::::", rows)

        ## 결과 출력
        for row in rows:
            print(row)

        ## 열 이름 가져오기
        columns = [desc[0] for desc in cur.description]

        # 각 행을 딕셔너리 형태로 변환하여 리스트에 추가
        data = [dict(zip(columns, row)) for row in rows]
        print(data)

        # 연결 종료
        cur.close()
        # conn.close()

        # JSON 형식의 데이터를 클라이언트에 반환
        # return data
        # return jsonify(EVENTS)
        return jsonify(data)

class GarageData(Resource):
    def get(self):
        # 클라이언트로부터 축제ID 받음
        id = request.args.get('id')
        # print("::::::::",FestivalID)

        # 축제 위치 정보 추출
        conn= get_db_connection()
        cur = conn.cursor()
        # cur.execute("SELECT Latitude, Longitude FROM Festivals WHERE FestivalID = :festival_id",
        #             {"festival_id": FestivalID})
        # festival_location = cur.fetchone()
        # latitude = festival_location[0]
        # longitude = festival_location[1]
        # print("위도,경도",latitude,longitude)

        cur.execute("SELECT Latitude, Longitude FROM Festivals WHERE FestivalID = :id",
                    {"id": id})
        event_location = cur.fetchone()
        if not event_location:
            cur.execute("SELECT Latitude, Longitude FROM Events WHERE EventID = :id",
                        {"id": id})
            event_location = cur.fetchone()

        if event_location:
            latitude = event_location[0]
            longitude = event_location[1]
        else:
            return jsonify({"error": "Invalid event ID"}), 400

        cur.close()

        # 축제 위치 정보 기반, 주변 시장 데이터 추출
        cur = conn.cursor()
        cur.execute(
            "SELECT * FROM MARKET WHERE (6371 * acos(cos(:latitude) * cos(LATITUDE) * cos(LONGITUDE - :longitude) + sin(:latitude) * sin(LATITUDE))) <= 100",
            {"latitude": latitude, "longitude": longitude})
        rows = cur.fetchall()
        columns = [desc[0] for desc in cur.description]
        market_data = [dict(zip(columns, row)) for row in rows]
        print("market_data::",market_data)
        cur.close()


        # 축제 위치 정보 기반, 주변 맛집 데이터 추출
        cur = conn.cursor()
        cur.execute(
            "SELECT * FROM RESTAURANTS WHERE (6371 * acos(cos(:latitude) * cos(LATITUDE) * cos(LONGITUDE - :longitude) + sin(:latitude) * sin(LATITUDE))) <= 300",
            {"latitude": latitude, "longitude": longitude})
        rows = cur.fetchall()
        columns = [desc[0] for desc in cur.description]
        yumyum_data = [dict(zip(columns, row)) for row in rows]
        cur.close()

        # JSON 형식의 데이터를 클라이언트에 반환
        return jsonify({
            "festival_location": {
                "latitude": latitude,
                "longitude": longitude
            },
            "market_data": market_data,
            "yumyum_data": yumyum_data
        })

api.add_resource(FestivalData, '/festivals')
api.add_resource(EventData, '/events')
api.add_resource(GarageData, '/garage_data')

if __name__ == '__main__':
    # app.run(debug=True, host='192.168.0.15')
    app.run(debug=True, host='localhost')
