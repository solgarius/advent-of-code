package com.aoc.app;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;

/**
 * Hello world!
 *
 */
public class App {
    public static void main(String[] args) {
        //String filepath = "java/day-20/aoc/src/main/resources/test.txt";
        String filepath = "java/day-20/aoc/src/main/resources/input.txt";

        InputFile inputFile = new InputFile(filepath);
        Map<String, Gate> gates = inputFile.getGates();
        System.out.println("Part 1: " + part1(gates));
        for(Gate gate : gates.values()){
            gate.state = Pulse.LOW;
        }
        System.out.println("Part 2: " + part2(gates));
    }

    static int part1(Map<String, Gate> gates) {
        int numLow = 0;
        int numHigh = 0;
        for(int i = 0; i < 1000; i++){
            List<Pulse> allPulses = pushButton(gates, false);
            for(Pulse pulse : allPulses){
                if(pulse.value == Pulse.LOW){
                    numLow++;
                } else {
                    numHigh++;
                }
            }
        }
        return numLow * numHigh;
    }

    static int part2(Map<String, Gate> gates) {
        int pushes = 0;
        while(true){
            List<Pulse> allPulses = pushButton(gates, true);
            pushes++;
            int rxLowCount = 0;
            for(Pulse pulse : allPulses){
                if(pulse.destination.name.equals("rx") && pulse.value == Pulse.LOW){
                    rxLowCount++;
                }
            }
            System.out.println(rxLowCount + " " + pushes);
            if(rxLowCount == 1){
                return pushes;
            }
        }
    }


    static List<Pulse> pushButton(Map<String, Gate> gates, boolean justRXLows) {
        List<Pulse> allPulses = new ArrayList<>();
        allPulses.add(new Pulse(gates.get("button"), gates.get("broadcaster"), Pulse.LOW));
        int lastProcessedPulse = 0;
        while (lastProcessedPulse < allPulses.size()) {
            Pulse pulse = allPulses.get(lastProcessedPulse);
            List<Pulse> newPulses = pulse.destination.processPulse(pulse);
            allPulses.addAll(newPulses);
            lastProcessedPulse++;
        }
        return allPulses;
    }
}
