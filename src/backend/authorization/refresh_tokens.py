
_store = {}

def save_refresh_token(token: str, email: str, expires: int):
    _store[token] = {"email": email, "expires": expires}

def get_refresh_token(token: str):
    return _store.get(token)

def delete_refresh_token(token: str):
    _store.pop(token, None)
