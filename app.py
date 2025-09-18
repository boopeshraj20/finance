import streamlit as st
import pandas as pd
import json
import os
from config import *
from financial_logic import *
from nlp_integration import NLPIntegration
from utils import *
import os
os.environ['PYTORCH_CUDA_ALLOC_CONF'] = 'max_split_size_mb=512'

# Initialize session state
if 'user_type' not in st.session_state:
    st.session_state.user_type = None
if 'chat_history' not in st.session_state:
    st.session_state.chat_history = []
if 'user_data' not in st.session_state:
    st.session_state.user_data = load_sample_data()
if 'nlp_integration' not in st.session_state:
    st.session_state.nlp_integration = NLPIntegration(INTENTS_PATH, NLP_MODEL_NAME)

# Page setup
st.set_page_config(page_title=APP_TITLE, page_icon=PAGE_ICON, layout="wide")
st.title(f"{PAGE_ICON} {APP_TITLE}")

# Sidebar for user input
with st.sidebar:
    st.header("User Profile")
    user_type = st.selectbox("I am a:", ["", "Student", "Professional"], index=0)
    
    if user_type:
        st.session_state.user_type = user_type.lower()
        
        income = st.number_input("Monthly Income ($)", min_value=0, step=100, value=st.session_state.user_data['income'])
        st.session_state.user_data['income'] = income
        
        st.subheader("Monthly Expenses")
        categories = ["Housing", "Food", "Transportation", "Entertainment", "Utilities", "Other"]
        expenses = {}
        for category in categories:
            amount = st.number_input(f"{category} ($)", min_value=0, step=10, value=st.session_state.user_data['expenses'].get(category, 0))
            expenses[category] = amount
        
        st.session_state.user_data['expenses'] = expenses
        
        # Update transactions based on expenses
        transactions = []
        for category, amount in expenses.items():
            transactions.append({
                "category": category,
                "amount": amount,
                "description": f"Monthly {category.lower()}"
            })
        st.session_state.user_data['transactions'] = transactions
        
        if st.button("Update Profile"):
            st.success("Profile updated successfully!")

# Main content area
col1, col2 = st.columns([3, 2])

with col1:
    st.header("Financial Chatbot")
    
    # Chat interface
    chat_container = st.container()
    
    with chat_container:
        for message in st.session_state.chat_history:
            if message["role"] == "user":
                st.markdown(f"**You:** {message['content']}")
            else:
                st.markdown(f"**Assistant:** {message['content']}")
    
    # User input
    user_input = st.text_input("Ask a financial question:", key="user_input")
    
    if st.button("Send") and user_input:
        # Add user message to chat history
        st.session_state.chat_history.append({"role": "user", "content": user_input})
        
        # Classify intent
        intent = st.session_state.nlp_integration.classify_intent(user_input)
        
        # Generate response based on intent
        if intent == "greeting":
            response = "Hello! I'm your financial advisor. How can I help you today?"
        elif intent == "goodbye":
            response = "Goodbye! Remember to track your expenses and save regularly. Come back anytime for financial advice!"
        elif intent == "budget_summary":
            budget_summary = calculate_budget_summary(
                st.session_state.user_data['income'],
                st.session_state.user_data['expenses']
            )
            response = f"Your monthly budget summary: Income: {format_currency(budget_summary['income'])}, Expenses: {format_currency(budget_summary['total_expenses'])}, Remaining: {format_currency(budget_summary['remaining'])}, Savings Rate: {budget_summary['savings_rate']:.1f}%."
        elif intent == "savings_advice":
            savings_rec = get_savings_recommendation(
                st.session_state.user_data['income'],
                st.session_state.user_type
            )
            response = f"{savings_rec['explanation']} We recommend saving {format_currency(savings_rec['recommended_amount'])} each month."
        elif intent == "spending_insights":
            insights = generate_spending_insights(
                st.session_state.user_data['transactions'],
                st.session_state.user_type
            )
            response = "Here are some insights about your spending:\n" + "\n".join(f"- {insight}" for insight in insights)
        elif intent == "investment_advice":
            response = generate_investment_advice(st.session_state.user_type)
        elif intent == "tax_guidance":
            response = generate_tax_guidance(st.session_state.user_type)
        else:
            # Use the NLP model to generate a response
            context = f"User is a {st.session_state.user_type} with monthly income of {format_currency(st.session_state.user_data['income'])} and expenses of {format_currency(sum(st.session_state.user_data['expenses'].values()))}."
            response = st.session_state.nlp_integration.generate_response(user_input, st.session_state.user_type)
        
        # Add assistant response to chat history
        st.session_state.chat_history.append({"role": "assistant", "content": response})
        
        # Clear input
        st.session_state.user_input = ""
        
        # Rerun to update chat
        st.experimental_rerun()

with col2:
    st.header("Financial Dashboard")
    
    # Budget summary
    budget_summary = calculate_budget_summary(
        st.session_state.user_data['income'],
        st.session_state.user_data['expenses']
    )
    
    st.subheader("Budget Summary")
    st.metric("Income", format_currency(budget_summary['income']))
    st.metric("Expenses", format_currency(budget_summary['total_expenses']))
    st.metric("Remaining", format_currency(budget_summary['remaining']))
    st.metric("Savings Rate", f"{budget_summary['savings_rate']:.1f}%")
    
    # Spending insights
    st.subheader("Spending Insights")
    insights = generate_spending_insights(
        st.session_state.user_data['transactions'],
        st.session_state.user_type
    )
    for insight in insights:
        st.markdown(f"- {insight}")
    
    # Visualizations
    st.subheader("Spending Distribution")
    spending_chart = create_spending_chart(st.session_state.user_data['transactions'])
    st.plotly_chart(spending_chart, use_container_width=True)
    
    st.subheader("Budget vs Income")
    budget_chart = create_budget_chart(
        st.session_state.user_data['income'],
        st.session_state.user_data['expenses']
    )
    st.plotly_chart(budget_chart, use_container_width=True)
    
    # Savings recommendation
    st.subheader("Savings Recommendation")
    savings_rec = get_savings_recommendation(
        st.session_state.user_data['income'],
        st.session_state.user_type
    )
    st.write(savings_rec['explanation'])
    st.metric("Recommended Monthly Savings", format_currency(savings_rec['recommended_amount']))

# Sample data directory
if not os.path.exists("data"):
    os.makedirs("data")

# Create sample data file if it doesn't exist
if not os.path.exists("data/sample_data.json"):
    with open("data/sample_data.json", "w") as f:
        json.dump(load_sample_data(), f, indent=2)

# Create intents file if it doesn't exist
if not os.path.exists("data/intents.json"):
    with open("data/intents.json", "w") as f:
        json.dump(load_intents(), f, indent=2)