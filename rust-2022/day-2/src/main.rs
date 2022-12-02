use std::error::Error;
use std::fs::File;
use std::io::{self, BufRead};
use std::process;
use std::path::Path;

fn run() -> Result<(), Box<dyn Error>> {
    let file_path = String::from("./data.csv");
    let lines = read_lines(file_path)?;
    let mut total_score_a = 0;
    let mut total_score_b = 0;
    for line in lines {
        let valid_line = line?;
        total_score_a += get_score(1, valid_line.clone());
        total_score_b += get_score(2, valid_line.clone());
    }
    println!("{}", total_score_a);
    println!("{}", total_score_b);
    Ok(())
}


fn get_score(method: i32, line: String) -> i32 {
    let a = b'A';
    let x = b'X';
    let their_move = line.as_bytes()[0] - a + 1;
    let mut your_move = line.as_bytes()[2] - x + 1;
    if method == 2 {
        your_move =  their_move + your_move - 2;
        if your_move == 0 {
            your_move = 3;
        }
        if your_move == 4 {
            your_move = 1;
        }
    }
    let outcome_score = get_outcome_score(their_move, your_move);
    // println!("{line} {their_move} {your_move} {outcome_score}");

    return outcome_score + (your_move) as i32;
}

fn get_outcome_score(their_move: u8, your_move: u8) -> i32 {
    let mut relative_move = your_move;
    if your_move +2 == their_move {
        relative_move = their_move + 1;
    } else if your_move == their_move + 2 {
        relative_move = their_move - 1;
    }

    if relative_move==their_move {
        return 3;
    }
    if relative_move < their_move {
        return 0;
    }
    return 6;
}

// The output is wrapped in a Result to allow matching on errors
// Returns an Iterator to the Reader of the lines of the file.
fn read_lines<P>(filename: P) -> io::Result<io::Lines<io::BufReader<File>>>
where P: AsRef<Path>, {
    let file = File::open(filename)?;
    Ok(io::BufReader::new(file).lines())
}

fn main() {
    if let Err(err) = run() {
        println!("{}", err);
        process::exit(1);
    }
}