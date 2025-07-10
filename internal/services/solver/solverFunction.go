package solver

import (
	"fmt"
	"go.uber.org/zap"
	"os"
)

func (s *Solver) CheckSubmission(solutionID int, compiler, code string, taskID int, userID int) {
	// THERE WILL BE 3 Available compilers (c++, python, java)
	codeToWrite := []byte(code)
	fileSring := "../../codeSolutions/solution%v."
	switch compiler {
	case "c++":
		fileSring += "cpp"
		break
	case "python":
		fileSring += "py"
		break
	case "java":
		fileSring += "java"
		break
	}
	err := os.WriteFile(fmt.Sprintf(fileSring, solutionID), codeToWrite, 0644)
	if err != nil {
		zap.L().Debug("Failed to write file", zap.Error(err))
	}
}

func solve(filename string, memory, time float64, taskID int, userID int) {

}
