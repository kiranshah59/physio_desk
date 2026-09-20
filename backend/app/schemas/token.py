from pydantic import BaseModel

class Token(BaseModel):
    access_token: str
    token_type: str
    user: dict = None

class TokenPayload(BaseModel):
    sub: str = None
