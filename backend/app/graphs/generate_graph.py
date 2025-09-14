from fastapi import FastAPI
from fastapi.responses import FileResponse
import matplotlib.pyplot as plt
import os

app = FastAPI()

def generate_and_save_graph():
    # Hardcoded data for the graph
    values = [50, 30, 10, 35, 20, 21, 15, 19, 20, 30, 60]

    # Calculate average
    avg_value = sum(values) / len(values)

    # Create the bar graph with Matplotlib
    fig, ax = plt.subplots(figsize=(8, 6))
    x_positions = range(len(values))
    ax.bar(x_positions, values, color="green", alpha=0.7, label="Values")

    # Add average line
    ax.axhline(avg_value, color="#32a852", linestyle="--", label=f"Average: {avg_value:.2f}")

    # Add labels and title
    ax.set_xlabel("Per Month of the Year")
    ax.set_ylabel("Amount of Money Saved Per Month")
    ax.set_title("Amount of Money Saved Throughout the Year")
    ax.legend()

    # Resolve the Downloads folder path
    downloads_dir = os.path.join(os.path.expanduser("~"), "Downloads")
    print(f"Resolved Downloads folder path: {downloads_dir}")

    # Save the graph to the Downloads folder
    file_path = os.path.join(downloads_dir, "bar_graph_with_average.png")
    try:
        plt.savefig(file_path)
        print(f"Graph saved as {file_path}. You can find it in your Downloads folder.")
    except Exception as e:
        print(f"Failed to save the graph: {e}")
        print("Displaying the graph instead.")
        plt.show()
    finally:
        plt.close(fig)

    # Print debug information
    print(f"Current working directory: {os.getcwd()}")

@app.get("/bar-graph-with-average")
def get_bar_graph():
    try:
        generate_and_save_graph()
        downloads_dir = os.path.join(os.path.expanduser("~"), "Downloads")
        file_path = os.path.join(downloads_dir, "bar_graph_with_average.png")
        return FileResponse(file_path, media_type="image/png", filename="bar_graph_with_average.png")
    except Exception as e:
        print(f"An error occurred: {e}")
        return {"error": str(e)}

if __name__ == "__main__":
    generate_and_save_graph()