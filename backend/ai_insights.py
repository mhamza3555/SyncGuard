import os
import google.generativeai as genai
from dotenv import load_dotenv
from sqlalchemy import text
from sqlalchemy.orm import Session

load_dotenv()

genai.configure(api_key=os.getenv("GEMINI_API_KEY"))
model = genai.GenerativeModel("gemini-2.5-flash")

SCHEMA_DESCRIPTION = """
Table: records
Columns: id, connector_id, external_id, title, status, owner, data_hash, updated_at
(status is either 'open' or 'closed')

Table: sync_runs
Columns: id, connector_id, started_at, finished_at, status, records_changed
(status is either 'running', 'success', or 'failed')

Table: connectors
Columns: id, name, status, last_synced_at
"""

def ask_question(question: str, db: Session) -> dict:
    sql_prompt = f"""You are a SQL expert. Given this database schema:

{SCHEMA_DESCRIPTION}

Write ONE PostgreSQL SELECT query (read-only, no INSERT/UPDATE/DELETE) to answer this question:
"{question}"

Respond with ONLY the raw SQL query, nothing else. No markdown, no explanation, no backticks."""

    sql_response = model.generate_content(sql_prompt)
    sql_query = sql_response.text.strip()

    if not sql_query.lower().startswith("select"):
        return {"answer": "I can only answer questions that involve reading data, not modifying it.", "sql": None}

    try:
        result = db.execute(text(sql_query))
        rows = result.fetchall()
        columns = result.keys()
        data = [dict(zip(columns, row)) for row in rows]
    except Exception as e:
        return {"answer": f"I couldn't run that query safely: {str(e)}", "sql": sql_query}

    answer_prompt = f"""The user asked: "{question}"

The query returned this data: {data}

Write a short, clear, one-to-two sentence answer in plain English based on this data."""

    answer_response = model.generate_content(answer_prompt)

    return {"answer": answer_response.text.strip(), "sql": sql_query}

def summarize_sync(records_changed: int, total_fetched: int) -> str:
    if records_changed == 0:
        return "No changes detected — everything is already up to date."

    prompt = f"""A sync just ran on a GitHub connector.
Total issues fetched: {total_fetched}
Records changed (new or updated): {records_changed}

Write ONE short, friendly sentence summarizing this sync for a dashboard. Keep it under 20 words."""

    response = model.generate_content(prompt)
    return response.text.strip()