import sys
import os
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))
import pytest
from bson.objectid import ObjectId
from restaurant_service import app



class FakeCollection:
    def __init__(self):
        self.data = {}

    def find(self):
        return self.data.values()

    def find_one(self, query):
        return self.data.get(str(query["_id"]))

    def insert_one(self, doc):
        _id = ObjectId()
        doc["_id"] = _id
        self.data[str(_id)] = doc
        return type("Result", (), {"inserted_id": _id})

    def update_one(self, query, update):
        doc = self.data.get(str(query["_id"]))
        if not doc:
            return type("Result", (), {"matched_count": 0})
        
        # Handle $set
        if "$set" in update:
            for k, v in update["$set"].items():
                doc[k] = v
        
        # Handle $push (for arrays)
        if "$push" in update:
            for k, v in update["$push"].items():
                if k not in doc:
                    doc[k] = []
                doc[k].append(v)
        
        return type("Result", (), {"matched_count": 1})

    def delete_one(self, query):
        if str(query["_id"]) in self.data:
            del self.data[str(query["_id"])]
            return type("Result", (), {"deleted_count": 1})
        return type("Result", (), {"deleted_count": 0})



@pytest.fixture
def client(monkeypatch):
    fake_db = FakeCollection()
    monkeypatch.setattr("restaurant_service.restaurants", fake_db)
    app.config["TESTING"] = True
    with app.test_client() as client:
        yield client, fake_db



def test_get_restaurants_empty(client):
    test_client, _ = client
    res = test_client.get("/restaurants")
    assert res.status_code == 200
    assert res.json == []


def test_create_restaurant(client):
    test_client, _ = client
    res = test_client.post("/restaurants", json={"name": "Pizza Place"})
    assert res.status_code == 201
    assert res.json["name"] == "Pizza Place"
    assert res.json["status"] == "closed"


def test_create_restaurant_missing_name(client):
    test_client, _ = client
    res = test_client.post("/restaurants", json={})
    assert res.status_code == 400


def test_get_restaurant_by_id(client):
    test_client, fake_db = client
    r = test_client.post("/restaurants", json={"name": "Burger"})
    rid = r.json["_id"]

    res = test_client.get(f"/restaurants/{rid}")
    assert res.status_code == 200
    assert res.json["name"] == "Burger"


def test_get_restaurant_not_found(client):
    test_client, _ = client
    res = test_client.get(f"/restaurants/{ObjectId()}")
    assert res.status_code == 404


def test_update_restaurant_status(client):
    test_client, _ = client
    r = test_client.post("/restaurants", json={"name": "Cafe"})
    rid = r.json["_id"]

    res = test_client.put(f"/restaurants/{rid}", json={"status": "open"})
    assert res.status_code == 200
    assert res.json["status"] == "open"


def test_delete_restaurant(client):
    test_client, _ = client
    r = test_client.post("/restaurants", json={"name": "Delete Me"})
    rid = r.json["_id"]

    res = test_client.delete(f"/restaurants/{rid}")
    assert res.status_code == 204


def test_open_restaurant(client):
    test_client, _ = client
    r = test_client.post("/restaurants", json={"name": "Open Me"})
    rid = r.json["_id"]

    res = test_client.post(f"/restaurants/{rid}/open")
    assert res.status_code == 200
    assert res.json["message"] == "Restaurant opened"


def test_add_menu_item(client):
    test_client, _ = client
    r = test_client.post("/restaurants", json={"name": "Menu Test"})
    rid = r.json["_id"]

    res = test_client.post(
        f"/restaurants/{rid}/menu",
        json={"name": "Pizza", "price": 10}
    )
    assert res.status_code == 201
    assert res.json["name"] == "Pizza"


def test_get_menu_item_not_found(client):
    test_client, _ = client
    r = test_client.post("/restaurants", json={"name": "Menu"})
    rid = r.json["_id"]

    res = test_client.get(f"/restaurants/{rid}/menu/123")
    assert res.status_code == 404
