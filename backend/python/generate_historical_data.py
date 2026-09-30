#!/usr/bin/env python3
"""
Generates realistic historical airline booking and no-show dataset.
Outputs to data/historical_bookings.csv
"""

import os
import random

def generate_csv(target_path, count=120):
    os.makedirs(os.path.dirname(target_path), exist_ok=True)
    
    first_names = ["James", "Emma", "Liam", "Olivia", "Noah", "Ava", "William", "Sophia", "Benjamin", "Isabella", 
                   "Lucas", "Mia", "Henry", "Evelyn", "Alexander", "Harper", "Sebastian", "Amelia", "Jack", "Charlotte",
                   "Aarav", "Priya", "Rohan", "Ananya", "Vikram", "Sneha", "Aditya", "Divya", "Rahul", "Pooja"]
    last_names = ["Smith", "Johnson", "Williams", "Brown", "Jones", "Garcia", "Miller", "Davis", "Rodriguez", "Martinez",
                  "Patel", "Sharma", "Rao", "Nair", "Iyer", "Verma", "Reddy", "Mehta", "Chopra", "Gupta"]

    random.seed(42) # Reproducible academic demo dataset

    records = []
    for i in range(1, count + 1):
        pid = f"PAX-{1000 + i}"
        name = f"{random.choice(first_names)} {random.choice(last_names)}"
        
        # 68% Economy, 22% Premium, 10% Business
        r = random.random()
        if r < 0.68:
            fare_class = "ECONOMY"
            base_prob = 0.155
        elif r < 0.90:
            fare_class = "PREMIUM"
            base_prob = 0.082
        else:
            fare_class = "BUSINESS"
            base_prob = 0.028

        total_prev = random.randint(1, 15)
        # Previous no shows
        prev_no_shows = max(0, int(round(random.betavariate(1, 6) * total_prev)))
        if prev_no_shows > total_prev:
            prev_no_shows = total_prev // 2

        # Outcome probability adjusted by history
        history_factor = (prev_no_shows / total_prev) if total_prev > 0 else base_prob
        adjusted_prob = 0.7 * base_prob + 0.3 * history_factor

        is_no_show = 1 if random.random() < adjusted_prob else 0
        status = "NO_SHOW" if is_no_show else "BOARDED"

        records.append((pid, fare_class, status, prev_no_shows, total_prev, is_no_show))

    with open(target_path, "w", encoding="utf-8") as f:
        f.write("passenger_id,fare_class,booking_status,previous_no_show_count,total_previous_bookings,no_show_outcome\n")
        for r in records:
            f.write(f"{r[0]},{r[1]},{r[2]},{r[3]},{r[4]},{r[5]}\n")

    print(f"Generated {count} records in {target_path}")

if __name__ == "__main__":
    out = os.path.join(os.path.dirname(__file__), "../../data/historical_bookings.csv")
    generate_csv(out)
