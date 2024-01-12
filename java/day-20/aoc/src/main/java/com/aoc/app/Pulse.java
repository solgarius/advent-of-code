package com.aoc.app;

public class Pulse {
    public static final int HIGH = 1;
    public static final int LOW = 0;

    public final Gate source;
    public final Gate destination;
    public final int value;

    public Pulse(Gate source, Gate destination, int value) {
        this.source = source;
        this.destination = destination;
        this.value = value;
    }
}
