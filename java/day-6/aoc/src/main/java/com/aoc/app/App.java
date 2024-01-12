package com.aoc.app;

import java.util.List;
import java.text.DecimalFormat;

/**
 * Hello world!
 *
 */
public class App {
    public static void main(String[] args) {
        //String filepath = "java/day-6/aoc/src/main/resources/test.txt";
        String filepath = "java/day-6/aoc/src/main/resources/input.txt";

        InputFile inputFile = new InputFile(filepath);
        List<Race> races = inputFile.getRaces();
        System.out.println("Part 1: " + part1(races));
        Race grandRace = inputFile.getGrandRace();
        double winningCount = getNumberWinningOptions(grandRace);
        DecimalFormat decimalFormat = new DecimalFormat("#");
        System.out.println("Part 2: " + decimalFormat.format(winningCount));
    }

    static int part1(List<Race> races) {
        int result = 1;
        for (Race race : races) {
            double winningCount = getNumberWinningOptions(race);
            System.out.println("Number of winning options: " + winningCount);
            result *= winningCount;
        }
        return result;
    }

    static double getNumberWinningOptions(Race race) {
        int winningCount = 0;
        for (double i = 0; i < race.duration; i++) {
            double d = getDistance(i, race.duration);
            if (d > race.record) {
                winningCount++;
            }
        }
        return winningCount;
    }

    static double getDistance(double chargeTime, double totalTime) {
        return chargeTime * (totalTime - chargeTime);
    }
}
