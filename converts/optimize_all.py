import onnxsim

models = ["best.onnx", "best2.onnx", "best3.onnx"]

for m in models:
    output_model = m.replace(".onnx", "_opt.onnx")
    print(f"Optimizing {m} -> {output_model}")
    model_opt, check = onnxsim.simplify(m)
    onnxsim.onnx.save(model_opt, output_model) # type: ignore
    print(f"Saved optimized model: {output_model}")
