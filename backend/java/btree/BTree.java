package com.airline.overbooking.btree;

import com.airline.overbooking.model.Booking;
import java.util.ArrayList;
import java.util.List;

/**
 * ADSA Concept: B-Tree Index for airline bookings.
 * 
 * Guarantees logarithmic O(log_t N) search, insertion, and range scan performance.
 * Specifically used in relational storage engines and file systems to minimize I/O block reads.
 */
public class BTree {
    private BTreeNode root;
    private final int t; // Minimum degree (default t=3 => min 2 keys, max 5 keys)
    private int size;

    public BTree(int t) {
        if (t < 2) {
            throw new IllegalArgumentException("B-Tree degree t must be >= 2");
        }
        this.t = t;
        this.root = null;
        this.size = 0;
    }

    public BTree() {
        this(3); // Standard degree t=3
    }

    public int getT() {
        return t;
    }

    public int getSize() {
        return size;
    }

    public BTreeNode getRoot() {
        return root;
    }

    /**
     * Search for booking by key (Booking ID or Passenger ID).
     * Time Complexity: O(t * log_t N)
     */
    public Booking search(String key) {
        if (root == null || key == null) {
            return null;
        }
        return root.search(key);
    }

    /**
     * Inserts a new booking with key into the B-tree.
     * Time Complexity: O(t * log_t N)
     */
    public void insert(String key, Booking booking) {
        if (key == null || booking == null) {
            throw new IllegalArgumentException("Key and Booking cannot be null");
        }

        // If tree is empty
        if (root == null) {
            root = new BTreeNode(t, true);
            root.getKeys().add(key);
            root.getValues().add(booking);
            size++;
            return;
        }

        // If root is full, then tree grows in height
        if (root.getKeys().size() == 2 * t - 1) {
            BTreeNode s = new BTreeNode(t, false);
            s.getChildren().add(root);
            s.splitChild(0, root);

            // Decide which child will have the new key
            int i = 0;
            if (s.getKeys().get(0).compareTo(key) < 0) {
                i++;
            }
            s.getChildren().get(i).insertNonFull(key, booking);

            // Update root
            root = s;
        } else {
            root.insertNonFull(key, booking);
        }
        size++;
    }

    /**
     * In-order traversal of all indexed bookings.
     */
    public List<Booking> getAllBookings() {
        List<Booking> list = new ArrayList<>();
        if (root != null) {
            root.inOrderTraversal(list);
        }
        return list;
    }

    public void clear() {
        this.root = null;
        this.size = 0;
    }
}
