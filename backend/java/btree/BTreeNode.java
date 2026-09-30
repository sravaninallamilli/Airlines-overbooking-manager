package com.airline.overbooking.btree;

import com.airline.overbooking.model.Booking;
import java.util.ArrayList;
import java.util.List;

/**
 * ADSA Concept: B-Tree Node for indexing bookings.
 * 
 * Properties for minimum degree t:
 * 1. Each node has at most 2t - 1 keys.
 * 2. Each internal node (except root) has at least t - 1 keys and t children.
 * 3. All leaves are at the same depth.
 */
public class BTreeNode {
    private final int t; // Minimum degree
    private final List<String> keys; // Booking IDs or Passenger IDs
    private final List<Booking> values; // Attached booking objects
    private final List<BTreeNode> children;
    private boolean leaf;

    public BTreeNode(int t, boolean leaf) {
        this.t = t;
        this.leaf = leaf;
        this.keys = new ArrayList<>();
        this.values = new ArrayList<>();
        this.children = new ArrayList<>();
    }

    public int getT() {
        return t;
    }

    public boolean isLeaf() {
        return leaf;
    }

    public void setLeaf(boolean leaf) {
        this.leaf = leaf;
    }

    public List<String> getKeys() {
        return keys;
    }

    public List<Booking> getValues() {
        return values;
    }

    public List<BTreeNode> getChildren() {
        return children;
    }

    public int getKeyCount() {
        return keys.size();
    }

    /**
     * Searches for a key in the subtree rooted with this node.
     * Returns the Booking if found, null otherwise.
     */
    public Booking search(String key) {
        int i = 0;
        while (i < keys.size() && key.compareTo(keys.get(i)) > 0) {
            i++;
        }

        // If the found key is equal to key, return the booking
        if (i < keys.size() && keys.get(i).equals(key)) {
            return values.get(i);
        }

        // If key is not found here and this is a leaf node
        if (leaf) {
            return null;
        }

        // Go to the appropriate child
        return children.get(i).search(key);
    }

    /**
     * Traverses all nodes in subtree and collects bookings in sorted key order.
     */
    public void inOrderTraversal(List<Booking> accumulator) {
        int i;
        for (i = 0; i < keys.size(); i++) {
            if (!leaf) {
                children.get(i).inOrderTraversal(accumulator);
            }
            accumulator.add(values.get(i));
        }

        if (!leaf) {
            children.get(i).inOrderTraversal(accumulator);
        }
    }

    /**
     * Inserts a new key and booking into this node when it is guaranteed not full.
     */
    public void insertNonFull(String key, Booking booking) {
        int i = keys.size() - 1;

        if (leaf) {
            // Find location to insert in leaf
            while (i >= 0 && keys.get(i).compareTo(key) > 0) {
                i--;
            }
            // Check for duplicate key update
            if (i >= 0 && keys.get(i).equals(key)) {
                values.set(i, booking);
                return;
            }
            keys.add(i + 1, key);
            values.add(i + 1, booking);
        } else {
            // Find child which is going to have the new key
            while (i >= 0 && keys.get(i).compareTo(key) > 0) {
                i--;
            }
            i++;

            // Check if child is full (2t - 1 keys)
            if (children.get(i).getKeys().size() == 2 * t - 1) {
                splitChild(i, children.get(i));

                // After split, the middle key moves up and child splits into two.
                // Determine which of the two will have the new key
                if (keys.get(i).compareTo(key) < 0) {
                    i++;
                }
            }
            children.get(i).insertNonFull(key, booking);
        }
    }

    /**
     * Splits child y of this node. Note that y must be full (2t - 1 keys).
     */
    public void splitChild(int i, BTreeNode y) {
        // Create new node z which will store (t - 1) keys of y
        BTreeNode z = new BTreeNode(y.getT(), y.isLeaf());

        int medianIndex = t - 1;
        String medianKey = y.getKeys().get(medianIndex);
        Booking medianValue = y.getValues().get(medianIndex);

        // Copy the last (t - 1) keys and values of y to z
        for (int j = 0; j < t - 1; j++) {
            z.getKeys().add(y.getKeys().get(medianIndex + 1 + j));
            z.getValues().add(y.getValues().get(medianIndex + 1 + j));
        }

        // Copy the last t children of y to z if y is not a leaf
        if (!y.isLeaf()) {
            for (int j = 0; j < t; j++) {
                z.getChildren().add(y.getChildren().get(t + j));
            }
        }

        // Shrink y's keys and values
        while (y.getKeys().size() > medianIndex) {
            y.getKeys().remove(y.getKeys().size() - 1);
            y.getValues().remove(y.getValues().size() - 1);
        }

        // Shrink y's children if internal node
        if (!y.isLeaf()) {
            while (y.getChildren().size() > t) {
                y.getChildren().remove(y.getChildren().size() - 1);
            }
        }

        // Insert z into children list of this node
        children.add(i + 1, z);

        // Move median key and value of y up to this node
        keys.add(i, medianKey);
        values.add(i, medianValue);
    }
}
