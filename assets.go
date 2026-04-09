// Package zana holds the embedded frontend assets that the Wails binary
// serves at runtime.
//
// The embed directive lives at the module root because //go:embed paths
// are relative to the source file's directory; a file under cmd/zana/
// cannot reach ../../frontend/dist. This file exists solely to host the
// embed — it has no other responsibilities.
package zana

import "embed"

//go:embed all:frontend/dist
var Assets embed.FS
