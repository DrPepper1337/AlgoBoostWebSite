package solver

import (
	"AlgoBoostWebSite/internal/models"
	"context"
	"fmt"
	"os"
	"time"

	"github.com/docker/docker/api/types"
	"github.com/docker/docker/api/types/container"
	"github.com/docker/docker/client"
)

func (s *Solver) CheckSubmission(solution *models.Solution) error {
	// THERE WILL BE 3 Available compilers (c++, python, java)
	codeToWrite := []byte(solution.Code)
	filename := os.Getenv("PATH_TO_USER_CODE") + "solution%v."
	switch solution.Compiler {
	case "c++":
		filename += "cpp"
		break
	case "python":
		filename += "py "
		break
	case "java":
		filename += "java"
		break
	}
	filename = fmt.Sprintf(filename, solution.ID)
	err := os.WriteFile(filename, codeToWrite, 0755)
	if err != nil {
		return err
	}
	task, err := s.db.GetTask(solution.TaskID)
	if err != nil {
		return err
	}
	err = solve(filename, task.MemoryLimit, task.TimeLimit)
	if err != nil {
		return err
	}
	return nil
}

func solve(filename string, memory, duration float64) error {
	ctx, cancel := context.WithTimeout(context.Background(), time.Duration(duration*float64(time.Second)))
	defer cancel()

	cli, err := client.NewClientWithOpts(client.FromEnv, client.WithAPIVersionNegotiation())
	if err != nil {
		return fmt.Errorf("failed to create docker client: %v", err)
	}

	resp, err := cli.ContainerCreate(ctx, &container.Config{
		Image: "golang:alpine", // Образ с установленным Go
		Cmd:   []string{"go", "run", "/usr/src/app/main.go"},
		Tty:   false,
	}, &container.HostConfig{
		Binds: []string{os.Getenv("PATH_TO_USER_CODE") + ":/usr/src/app"},
		Resources: container.Resources{
			Memory:   int64(memory),
			CPUQuota: 5000,
		},
		AutoRemove: true, // Автоматическое удаление контейнера после завершения
	}, nil, nil, "")
	if err != nil {
		return fmt.Errorf("failed to create container: %v", err)
	}

	// Запускаем контейнер
	if err := cli.ContainerStart(ctx, resp.ID, types.ContainerStartOptions{}); err != nil {
		return fmt.Errorf("failed to start container: %v", err)
	}

	// Ждем завершения контейнера
	statusCh, errCh := cli.ContainerWait(ctx, resp.ID, container.WaitConditionNotRunning)
	select {
	case err := <-errCh:
		if err != nil {
			return fmt.Errorf("container wait error: %v", err)
		}
	case <-statusCh:
	}

	// Получаем логи контейнера
	// out, err := cli.ContainerLogs(ctx, resp.ID, types.ContainerLogsOptions{ShowStdout: true})
	// if err != nil {
	// 	return fmt.Errorf("failed to get container logs: %v", err)
	// }
	// defer out.Close()

	// Читаем логи
	// buf := new(strings.Builder)
	// _, err = io.Copy(buf, out)
	// if err != nil {
	// 	return fmt.Errorf("failed to read container logs: %v", err)
	// }

	return nil

}
