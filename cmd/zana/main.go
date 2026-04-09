// Command zana is the Zana desktop app entry point.
package main

import (
	"context"
	"log/slog"
	"os"

	"github.com/wailsapp/wails/v2"
	"github.com/wailsapp/wails/v2/pkg/options"
	"github.com/wailsapp/wails/v2/pkg/options/assetserver"

	"github.com/herocod3r/zana"
)

func main() {
	logger := slog.New(slog.NewTextHandler(os.Stderr, nil))

	err := wails.Run(&options.App{
		Title:     "Zana",
		Width:     1280,
		Height:    800,
		MinWidth:  800,
		MinHeight: 500,
		AssetServer: &assetserver.Options{
			Assets: zana.Assets,
		},
		BackgroundColour: &options.RGBA{R: 11, G: 11, B: 14, A: 1},
		OnStartup: func(ctx context.Context) {
			_ = ctx // wired to real handlers in a later plan
			logger.Info("zana starting")
		},
		Bind: []interface{}{},
	})
	if err != nil {
		logger.Error("wails run failed", "err", err)
		os.Exit(1)
	}
}
