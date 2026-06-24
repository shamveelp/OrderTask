from fastapi import FastAPI

app = FastAPI(
    title="OrderFlow API",
    version="1.0.0"
)

@app.get("/")
def root():
    return {"message": "OrderFlow API Running"}