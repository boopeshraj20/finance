def calculate_budget_summary(income, expenses):
    total_expenses = sum(expenses.values())
    remaining = income - total_expenses
    savings_rate = (remaining / income) * 100 if income > 0 else 0
    
    return {
        "income": income,
        "total_expenses": total_expenses,
        "remaining": remaining,
        "savings_rate": savings_rate
    }

def generate_spending_insights(transactions, user_type):
    insights = []
    total_spending = sum(t['amount'] for t in transactions)
    
    # Calculate category percentages
    category_totals = {}
    for t in transactions:
        category_totals[t['category']] = category_totals.get(t['category'], 0) + t['amount']
    
    for category, amount in category_totals.items():
        percentage = (amount / total_spending) * 100
        
        if category == "Food" and percentage > 20:
            if user_type == "student":
                insights.append(f"You're spending {percentage:.1f}% on food. Consider meal prepping to save money.")
            else:
                insights.append(f"Your food spending is {percentage:.1f}% of your budget. This is above the recommended 15%.")
        
        elif category == "Entertainment" and percentage > 10:
            if user_type == "student":
                insights.append(f"Entertainment is {percentage:.1f}% of your spending. Look for student discounts!")
            else:
                insights.append(f"Entertainment spending at {percentage:.1f}% is high. Consider budgeting for leisure activities.")
        
        elif category == "Housing" and percentage > 40:
            insights.append(f"Housing costs are {percentage:.1f}% of your budget. Financial experts recommend keeping this under 30%.")
    
    if not insights:
        insights.append("Your spending distribution looks balanced across categories.")
    
    return insights

def get_savings_recommendation(income, user_type):
    if user_type == "student":
        recommended_rate = 0.15  # 15% for students
        explanation = "As a student, we recommend saving 15% of your income for emergencies and future goals."
    else:
        recommended_rate = 0.20  # 20% for professionals
        explanation = "As a professional, we recommend saving at least 20% of your income for retirement and investments."
    
    recommended_amount = income * recommended_rate
    
    return {
        "recommended_amount": recommended_amount,
        "recommended_rate": recommended_rate,
        "explanation": explanation
    }

def generate_investment_advice(user_type):
    if user_type == "student":
        return "As a student, focus on low-risk investments like high-yield savings accounts or CDs. Consider opening a Roth IRA for long-term growth."
    else:
        return "As a professional, consider diversifying your portfolio with stocks, bonds, and retirement accounts. Max out your 401(k) employer match first."

def generate_tax_guidance(user_type):
    if user_type == "student":
        return "Students may qualify for education tax credits like the American Opportunity Credit. Keep records of your tuition payments and education expenses."
    else:
        return "Professionals should maximize tax-advantaged accounts like 401(k)s and HSAs. Consider consulting with a tax professional about deductions and credits."