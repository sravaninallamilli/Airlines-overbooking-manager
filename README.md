# AIRLINE OVERBOOKING MANAGER
*An Academic Prototype Integrating Discrete Mathematics (DMGT), Advanced Data Structures (ADSA), Object-Oriented Programming (OOPJ), and Machine Learning / Statistical Estimation (Python)*

---

## 1. Problem Statement

Commercial airlines routinely face the **No-Show Phenomenon**: confirmed passengers fail to arrive for departure due to missed connections, personal delays, or schedule changes. Operating flights with empty seats leads to substantial perishable revenue loss. Conversely, aggressive or naive overbooking leads to **denied boarding (involuntary bumping)**, severe passenger dissatisfaction, civil regulatory fines, and hotel/re-routing compensation expenses.

### Core Objective
To engineer a mathematically sound, data-driven reservation and overbooking management system that:
1. Safely calculates optimal overbooking thresholds based on empirical no-show probability distributions.
2. Partitions passengers by fare classes to prioritize high-yield loyalty travelers.
3. Indexes active reservations using an external-memory-efficient **B-Tree** structure for $O(\log_t N)$ search and retrieval.
4. Protects the airline against catastrophic bumping cascades through conservative binomial risk thresholds ($\le 5\%$ bumping tolerance).

---

## 2. Technologies Used

| Domain | Technology / Library | Academic & Engineering Purpose |
| :--- | :--- | :--- |
| **Frontend** | React 19, TypeScript, Tailwind CSS, Lucide Icons | Responsive airline ops dashboard, real-time B-Tree visualizer, interactive DMGT set diagrams |
| **Backend (Core Logic)** | Java 21 (OOPJ & ADSA) | Object-oriented reservation system, B-Tree index, fare-class partitioning, safe limit calculation |
| **Statistical / ML Engine** | Python 3.10+ (NumPy / SciPy / CSV) | Historical passenger telemetry processing, empirical Bayesian probability estimation |
| **Data Interchange** | CSV & JSON Files | Clean contract for exporting historical booking/no-show records from Java to Python |
| **Build & Tooling** | Vite 8, Node.js 22 | Modern bundler, fast module replacement, and client-side simulation engine |

---

## 3. DMGT Concept: Passenger Partitioning by Fare Class (Unit 2)

### Mathematical Formulation
Let $S$ denote the universal set of all passengers with confirmed reservations on flight $F$:
$$S = \{ p_1, p_2, \dots, p_N \}$$

We define an **equivalence relation** $R$ on $S$ based on fare class attribute:
$$(x, y) \in R \iff \text{fareClass}(x) = \text{fareClass}(y)$$

Since $R$ satisfies:
1. **Reflexivity**: $\forall x \in S, (x, x) \in R$ (Every passenger has the same fare class as themselves).
2. **Symmetry**: $\forall x, y \in S, (x, y) \in R \implies (y, x) \in R$.
3. **Transitivity**: $\forall x, y, z \in S, ((x, y) \in R \land (y, z) \in R) \implies (x, z) \in R$.

$R$ induces a **quotient set** $S / R = \{E, P, B\}$, partitioning $S$ into three equivalence classes:
- **$E$ (Economy Class Set)**
- **$P$ (Premium Economy Set)**
- **$B$ (Business Class Set)**

### Fundamental Partition Properties
1. **Exhaustive Union**:
   $$E \cup P \cup B = S$$
2. **Pairwise Disjoint**:
   $$E \cap P = \emptyset, \quad E \cap B = \emptyset, \quad P \cap B = \emptyset$$
3. **Sum Rule of Cardinality**:
   $$|S| = |E| + |P| + |B|$$

In overbooking mitigation, if voluntary/involuntary bumping becomes unavoidable, the airline bumps from $E$ first, safeguarding $P$ and $B$.

---

## 4. ADSA Concept: B-Tree Booking Index (Unit 1)

In airline reservation databases containing millions of booking records, in-memory binary search trees incur significant disk block read latencies ($O(\log_2 N)$ disk I/O). A **B-Tree of minimum degree $t$** reduces disk seek depth to $O(\log_t N)$.

### Structural Invariants (Degree $t = 3$)
1. **Root**: Contains between $1$ and $2t - 1 = 5$ keys.
2. **Internal Nodes**: Contain between $t - 1 = 2$ and $2t - 1 = 5$ keys, and between $t = 3$ and $2t = 6$ child pointers.
3. **Key Ordering**: Within any node, keys $k_1 < k_2 < \dots < k_m$ are maintained in strictly ascending alphanumeric order (e.g. `BKG-101`, `BKG-102`).
4. **Subtree Bounds**: For key $k_i$, child $c_i$ contains keys $< k_i$, and child $c_{i+1}$ contains keys $> k_i$.
5. **Uniform Leaf Depth**: All leaf nodes reside at the exact same depth $h \le \log_t \frac{N+1}{2}$.

### Time & Space Complexities
- **Search**: $O(t \log_t N)$
- **Insertion**: $O(t \log_t N)$ with proactive child splitting
- **In-Order Traversal**: $O(N)$
- **Space**: $O(N)$

---

## 5. OOPJ Concepts: Reservation System Architecture

The core Java reservation architecture strictly adheres to core Object-Oriented Programming principles:

```
+-------------------------------------------------------------+
|                     ReservationSystem                       |
+-------------------------------------------------------------+
| - currentFlight: Flight                                     |
| - passengerDirectory: Map<String, Passenger>                |
| - bookingIndex: BTree                                       |
| - fareClassPartition: FareClassPartition                    |
+-------------------------------------------------------------+
| + createBooking(bookingId, passengerId, status): Booking    |
| + cancelBooking(bookingId): boolean                         |
| + searchBooking(bookingId): Booking                         |
| + exportHistoricalDataToCsv(filePath): void                 |
| + evaluateOverbookingLimit(prob): OverbookingResult         |
+-------------------------------------------------------------+
             |                                    |
             v 1..*                               v 1..1
+---------------------------+        +---------------------------+
|          Booking          |        |          Flight           |
+---------------------------+        +---------------------------+
| - bookingId: String       |        | - flightNumber: String    |
| - flightNumber: String    |        | - source: String          |
| - passenger: Passenger    |        | - destination: String     |
| - status: Status          |        | - aircraftCapacity: int   |
| - seatNumber: int         |        | - maxAllowedOverbk: int   |
+---------------------------+        +---------------------------+
             |
             v 1..1
+---------------------------+
|         Passenger         |
+---------------------------+
| - passengerId: String     |
| - fullName: String        |
| - fareClass: FareClass    |
| - previousNoShowCount: int|
| - totalPreviousBookings:int|
+---------------------------+
```

### OOP Principles Applied
1. **Encapsulation**: Private fields accessed solely through validated getters and setters (e.g., verifying capacity $> 0$ and no-show counts $\le$ total bookings).
2. **Polymorphism & Interfaces**: `Comparable<Booking>` for natural B-Tree indexing.
3. **Composition**: `ReservationSystem` composes `BTree`, `FareClassPartition`, and `Flight`.
4. **Single Responsibility Principle**: Distinct classes for entity models, indexing structures, mathematical partitions, and statistical calculators.

---

## 6. Python No-Show Prediction

The Python module `backend/python/no_show_predictor.py` ingests historical flight telemetry and applies an **Empirical Bayesian Estimator**:

### Mathematical Model
Given historical records with total no-shows $S_{hist}$ across $N_{hist}$ bookings, and a domain prior mean $\mu_0 = 0.10$ with prior confidence weight $w = 10$:

$$p_{est} = \frac{S_{hist} + w \cdot \mu_0}{N_{hist} + w}$$

### Risk Classification
- **Low probability**: $p_{est} < 8\%$
- **Medium probability**: $8\% \le p_{est} \le 16\%$
- **High probability**: $p_{est} > 16\%$

---

## 7. Safe Overbooking Calculation (Java Service)

Let:
- $C$ = Physical Aircraft Capacity
- $N$ = Current Confirmed Bookings
- $p$ = Estimated No-Show Probability from Python
- $\gamma$ = Conservative Safety Buffer Factor ($0.65$)

### Calculation Steps
1. **Expected No-Shows**:
   $$\mathbb{E}[\text{No-Shows}] = N \cdot p$$

2. **Recommended Additional Bookings**:
   $$\Delta_{\text{safe}} = \min\left( \lfloor \mathbb{E}[\text{No-Shows}] \cdot \gamma \rfloor, \text{MaxAllowedOverbooking} \right)$$

3. **Maximum Safe Bookings (Ceiling)**:
   $$N_{\text{safe}} = C + \Delta_{\text{safe}}$$

4. **Bumping Risk Estimation**:
   Modeling arrivals $X \sim \text{Binomial}(N_{\text{safe}}, 1 - p)$, bumping occurs when $X > C$. Using the normal approximation:
   $$Z = \frac{C + 0.5 - \mu}{\sigma}, \quad \mu = N_{\text{safe}}(1-p), \quad \sigma = \sqrt{N_{\text{safe}} p (1-p)}$$
   $$\text{Risk} = P(X > C) = 1 - \Phi(Z)$$

---

## 8. Complete System Workflow

```
[ 1. Flight Setup ]
  -> Set Flight No, Capacity (e.g., 100), Max Overbooking (e.g., 15)
         |
[ 2. Passenger Booking ]
  -> Enter Passenger info, Fare Class (Economy / Premium / Business), past history
         |
[ 3. Fare Class Partitioning (DMGT) ]
  -> Update Disjoint Sets: E, P, B. Check E ∩ P = ∅ and |S| = |E| + |P| + |B|
         |
[ 4. B-Tree Booking Index (ADSA) ]
  -> Insert into B-Tree of degree t=3; Enable O(log N) search by Booking ID
         |
[ 5. Historical Data Export ]
  -> Export booking history and past outcomes to data/historical_bookings.csv
         |
[ 6. Python Statistical Engine ]
  -> Read CSV, compute empirical Bayesian no-show probability and risk tier
         |
[ 7. Java Safe Overbooking Service ]
  -> Compute Expected No-Shows, Recommended Overbooking, Safe Booking Ceiling
         |
[ 8. Interactive Ops Dashboard ]
  -> Display Capacity, Load Factor, Set Visuals, B-Tree Graph, and Flight Readiness
```

---

## 9. How to Run the Project

### Running the Web Application (Interactive Dashboard & Visualizer)
```bash
# Install dependencies
npm install

# Start Vite dev server on port 3000
npm run dev
```
Open your browser at `http://localhost:3000`.

### Running the Python Predictor Standalone
```bash
# Generate fresh historical dataset
python3 backend/python/generate_historical_data.py

# Run prediction module on CSV
python3 backend/python/no_show_predictor.py
```

### Running the Java Prototype Standalone
```bash
# Compile Java classes
javac -d bin backend/java/model/*.java backend/java/btree/*.java backend/java/dmgt/*.java backend/java/service/*.java backend/java/reservation/*.java backend/java/Main.java

# Run Java Academic Demonstration
java -cp bin com.airline.overbooking.Main
```
