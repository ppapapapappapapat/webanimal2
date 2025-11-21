@app.post("/detect/")
async def detect_animal(file: UploadFile = File(...)):
    # ...detection logic...
    for det in detections:
        det["lifespan"] = get_lifespan(det["species"])
        det["healthDiagnosis"] = get_health_diagnosis(det["species"])
    return {"detections": detections}